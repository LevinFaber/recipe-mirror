import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useCatch, } from "@remix-run/react";
import { checkUrl,  } from "~/models/recipe.server";

export const loader: LoaderFunction = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const queryUrl = requestUrl.searchParams.get("url") ?? undefined;

  return checkUrl(queryUrl) ?? redirect("/recipe");
};


export default function NoteDetailsPage() {
  return <></>
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

  throw new Error(`Unexpected caught response with status: ${ caught.status }`);
}
