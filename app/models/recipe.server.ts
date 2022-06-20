//import { Recipe } from "schema-dts";
import type { Recipe } from "@prisma/client";
import { redirect } from "@remix-run/server-runtime/responses";
import { prisma } from "~/db.server";
import { parse } from "node-html-parser";
import type {
  CreativeWork,
  Graph,
  Recipe as RecipeLd,
  Thing,
} from "schema-dts";

const tagCount = {
  tags: {
    select: {
      name: true,
      id: true,
      slug: true,
      _count: {
        select: {
          recipes: true,
        },
      },
    },
  },
};
export async function getRecipe(query: {
  id?: Recipe["id"];
  url?: Recipe["url"];
  slug?: Recipe["slug"];
}) {
  return await prisma.recipe.findFirst({
    where: { ...query },
    include: {
      ...tagCount,
      ingredients: true,
      instructions: true,
    },
  });
}

export async function saveRecipe(recipe: RecipeLd, lang: string, url: string) {
  const strippedUrl = url.replace(/^https?:\/\//, "");
  const tags = [recipe.recipeCategory, recipe.keywords].reduce<Set<string>>(
    (acc, curr) => {
      const elements = [];
      if (Array.isArray(curr)) {
        elements.push(...curr);
      } else if (typeof curr === "string") {
        elements.push(...curr.split(",").map((x) => x.trim()));
      }

      elements.forEach((x) => acc.add(x));
      return acc;
    },
    new Set<string>()
  );

  const ingredientArray = Array.isArray(recipe.recipeIngredient)
    ? recipe.recipeIngredient
    : [recipe.recipeIngredient];

  const instructionArray = extractSteps(recipe.recipeInstructions);

  const data: Parameters<typeof prisma.recipe.upsert>[0]["create"] = {
    description: recipe.description?.toString() ?? "",
    name: recipe.name?.toString() ?? strippedUrl,
    lang,
    url,
    slug: createSlugUrl(url),
    ingredients: {
      create: ingredientArray.map((ingredirentString, index) => ({
        position: index,
        text: ingredirentString
      }))
    },
    instructions: {
      create: instructionArray.map((instruction, index) => ({
        position: index,
        title: instruction.titel,
        text: instruction.text
      })),
    },
    tags: {
      connectOrCreate: Array.from(tags).map((tag) => ({
        where: {
          name: tag,
        },
        create: {
          name: tag,
          slug: createSlug(tag),
        },
      })),
    },
  };

  const existing = await prisma.recipe.findFirst({
    where: {
      slug: data.slug,
    }
  });

  if (existing) {
    await prisma.$transaction([
      prisma.instruction.deleteMany({
        where: {
          recipe: existing
        }
      }),
      prisma.ingredient.deleteMany({
        where: {
          recipe: existing
        }
      }),
    ]);
  }

  const saved = await prisma.recipe.upsert({
    where: {
      slug: data.slug,
    },
    create: data,
    update: data,
  });


  return saved;
}

export function getRecipes() {
  return prisma.recipe.findMany({
    where: {},
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function checkUrl(queryUrl?: string) {
  if (queryUrl) {
    const saved = await addFromUrlToDB(queryUrl);
    return redirect(`/recipe/${saved.slug}`);
  }
  return null;
}

export async function refreshRecipe(id: number) {
  const recipe = await getRecipe({ id });
  if (recipe) {
    const { recipe: ldRecipe, lang } = await loadRecipeData(recipe.url);
    const saved = await saveRecipe(ldRecipe, lang, recipe.url);
    return redirect(`/recipe/${saved.slug}`);
  }
  return null;
}

export async function addFromUrlToDB(queryUrl: string) {
  const { recipe, lang } = await loadRecipeData(queryUrl);
  const saved = await saveRecipe(recipe, lang, queryUrl);
  return saved;
}

export async function loadRecipeData(queryUrl: string): Promise<{
  recipe: RecipeLd;
  lang: string;
}> {
  const documentHtml = await (await fetch(queryUrl))?.text();

  if (!documentHtml) {
    throw new Error("Unable to get document");
  }

  const parsed = parse(documentHtml);

  const language =
    parsed.querySelector("html")?.getAttribute("lang")?.split("-")[0] ?? "en";

  const scriptTags = parsed.querySelectorAll(
    'script[type="application/ld+json"]'
  );

  const recipeData = scriptTags
    .flatMap((scriptTag) => {
      try {
        const json = JSON.parse(scriptTag.text);
        if (json["@graph"]) {
          return (json as Graph)["@graph"];
        }
        return [json as Thing];
      } catch (e) {
        return [];
      }
    })
    //.filter(<T>(json: T | null): json is T => Boolean(json))
    .find(
      (json): json is RecipeLd => (json as CreativeWork)["@type"] === "Recipe"
    );

  if (!recipeData) {
    throw new Error("Unable to find recipe data");
  }
  return {
    recipe: recipeData as RecipeLd,
    lang: language,
  };
}

function createSlugUrl(urlString: string) {
  const url = new URL(urlString);
  const domainParts = url.hostname.split(".");
  const domainName = domainParts[domainParts.length - 2];
  const step = `${domainName}-${url.pathname}`;
  return createSlug(step);
}
function createSlug(step: string) {
  const cleaned = step.replace(/[^a-zA-Z0-9]/g, "-");
  const dedupe = cleaned.replace(/-+/g, "-");
  const trimmed = dedupe.replace(/^-/, "").replace(/-$/, "");
  return trimmed;
}


interface InstructionStep {
  titel: string,
  text: string,
}

function extractSteps(steps: any): InstructionStep[] {
  // const steps = recipe.recipeInstructions;

  // if (!steps) return [];
  if (typeof steps === "string") {
    return [{
      titel: "",
      text: steps,
    }];
  }

  if (Array.isArray(steps)) {
    return steps.flatMap((step, index): InstructionStep | InstructionStep[] => {
      if (step.hasOwnProperty("itemListElement")) {
        return extractSteps(step.itemListElement);
      }

      if (step.hasOwnProperty("text") && step.hasOwnProperty("name")) {
        return {
          titel: step.name,
          text: step.text,
        };
      }

      return extractSteps(step);
    });
  }

  return [];
}