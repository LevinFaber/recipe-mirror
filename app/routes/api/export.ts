import { json } from "@remix-run/server-runtime";
import type { LoaderFunction } from "@remix-run/server-runtime";
import parse from "node-html-parser";
import invariant from "tiny-invariant";
import { addFromUrlToDB } from "~/models/recipe.server";
import { prisma } from "~/db.server";

interface ExporterOutput {

}


export const loader: LoaderFunction = async ({ request }) => {
  const results = await prisma.recipe.findMany({
    include: {
      ingredients: true,
      instructions: true,
      tags: true,
    },
  });

  return json({ results });
};

