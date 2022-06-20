import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getCategory } from "~/models/category.server";

type LoaderData = {
  category: NonNullable<Awaited<ReturnType<typeof getCategory>>>;
};

export const loader: LoaderFunction = async ({  params }) => {
  invariant(params.categoryName, "no category");

  const category = await getCategory(params.categoryName);
  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ category });
};

export default function CategoryDetailsPage() {
  const data = useLoaderData() as LoaderData;
  return (
    <div>
      <h1>{data.category.name}</h1>
      <span>{data.category._count.recipes} Recipes in this category</span>

      <ol>
        {data.category.recipes.map(({ name, slug }) => (
          <li key={slug}><Link to={`/recipe/${slug}`}>{name}</Link></li>
        ))}
      </ol>
    </div>
  );
}