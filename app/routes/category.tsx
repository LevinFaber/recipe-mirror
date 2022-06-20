import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import  { useMemo, useState } from "react";
import { MainLayout } from "~/components/MainLayout";

import { getCategories } from "~/models/category.server";

type LoaderData = {
  categoriesListItems: Awaited<ReturnType<typeof getCategories>>;
};

export const loader: LoaderFunction = async () => {
  const categoriesListItems = await getCategories();
  return json<LoaderData>({ categoriesListItems });
};



export default function CategoryPage() {
  const [searchString, setSearchString] = useState("");
  const data = useLoaderData() as LoaderData;

  const items = useMemo(() => {
    if (!searchString) {
      return data.categoriesListItems;
    }

    return data.categoriesListItems.filter(({ name }) => name.toLowerCase().includes(searchString.toLowerCase()));
  }, [data.categoriesListItems, searchString]);


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
        <p>No Categories</p>
      ) : (
        <ol>
          {items.map((categoriesListItems) => (
            <li key={categoriesListItems.slug}>
              <NavLink
                to={categoriesListItems.slug+""}
              >
                🎯 {categoriesListItems.name} ({categoriesListItems._count.recipes})
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </div>}>
      <Outlet />
    </MainLayout>
  );
}
