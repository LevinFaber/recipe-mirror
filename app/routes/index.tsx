import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import React, { useMemo, useState } from "react";

import { checkUrl, getRecipes } from "~/models/recipe.server";

type LoaderData = {
  recipeListItems: Awaited<ReturnType<typeof getRecipes>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const recipeListItems = await getRecipes();
  return json<LoaderData>({ recipeListItems });
};


export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const url = formData.get("url")?.toString();

  if (!url) {
    return json({ errors: { url: "URL is required" } }, { status: 400 });
  }
  const response = await checkUrl(url);

  if (response) {
    return response;
  }
};


export default function Homepage() {


  return (
    <h1>home</h1>
  );
}
