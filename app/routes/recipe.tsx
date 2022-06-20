import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import React, { useMemo, useState } from "react";
import { MainLayout } from "~/components/MainLayout";

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


export default function NotesPage() {
  const [searchString, setSearchString] = useState("");
  const data = useLoaderData() as LoaderData;

  const items = useMemo(() => {
    if (!searchString) {
      return data.recipeListItems;
    }

    return data.recipeListItems.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()));
  }, [data.recipeListItems, searchString]);


  return (
    <MainLayout sideBar={<div>
      <input
        type="text"
        placeholder="Search"
        className="search-input"
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
      {items.length === 0 ? (
        <p className="p-4">No recipes</p>
      ) : (
        <ol>
          {items.map((recipe) => (
            <li key={recipe.id}>
              <NavLink
                className={({ isActive }) =>
                  `block border-b p-4 text-xl ${ isActive ? "bg-white" : "" }`
                }
                to={recipe.slug}
              >
                📝 {recipe.name}
              </NavLink>
            </li>
          ))}
        </ol>
      )}
      <Form method="post" className="space-y-6">
        <div>
          <label
            htmlFor="email"
          >
            Load Recipe from URL
          </label>
          <div className="mt-1">
            <input
              id="url"
              required
              name="url"
              type="url"
              autoComplete="url"
            />
          </div>
        </div>
      </Form>
    </div>}>
      <Outlet />
    </MainLayout>
  );
}
