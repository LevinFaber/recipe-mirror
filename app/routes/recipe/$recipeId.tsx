import { Recipe } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getRecipe, refreshRecipe } from "~/models/recipe.server";

type LoaderData = {
  recipe: NonNullable<Awaited<ReturnType<typeof getRecipe>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  invariant(params.recipeId, "noteId not found");

  const recipe = await getRecipe({ slug: params.recipeId });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ recipe });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const recipeId = formData.get("recipeId")?.toString();

  if (!recipeId) {
    throw new Response("Bad Request", { status: 400 });
  }

  return refreshRecipe(+recipeId);
};

export default function RecipeDetailsPage() {
  const data = useLoaderData() as LoaderData;
  return (
    <div>
      <h1 className="">{data.recipe.name}</h1>
      <a href={data.recipe.url}>{data.recipe.url}</a>
      <p className="">{data.recipe.description}</p>
      <hr className="" />
      <div className="side-by-side">
        <div>
          <h2>Ingredirents</h2>
          <ol>
            {data.recipe.ingredients.map(({ text, position }) => (
              <li key={position}>{text}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2>Categories</h2>
          <ul>
            {data.recipe.tags.map(({ name, id: tagId, _count, slug }) => (
              <li key={tagId}>
                <Link to={slug}>{name} ({_count.recipes})</Link>
                
              </li>
            ))}
          </ul>
        </div>
      </div>
      <h2>Steps</h2>
      <ol>
        {data.recipe.instructions.map(({ text, title, position }) => (
          <li key={position}>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <Form method="post">
        <input type="hidden" name="recipeId" value={data.recipe.id} />
        <button>Refresh</button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
