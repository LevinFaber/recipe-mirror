import { json } from "@remix-run/server-runtime";
import type { LoaderFunction } from "@remix-run/server-runtime";
import parse from "node-html-parser";
import invariant from "tiny-invariant";
import { addFromUrlToDB } from "~/models/recipe.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const sitemapUrl = params.get("sitemap");
  invariant(sitemapUrl, "url is required");

  const urls = await loadUrlsFromSitemap(sitemapUrl);

  const functionCalls = urls.map((url) => async () => {
    try {
      return await addFromUrlToDB(url);
    } catch (e) {
      console.warn("Failed to load recipe", url);
    }
  });

  const results = await throttleFunction(10, functionCalls, () => {});

  return json({ results });
};

async function loadUrlsFromSitemap(sitemapUrl: string) {
  const response = await fetch(sitemapUrl);
  const sitemap = await response.text();
  // Parse sitemap as xml;
  const xml = parse(sitemap);
  const urls = xml.querySelectorAll("url > loc");
  const urlsArray = Array.from(urls).map((url) => url.text);
  return urlsArray;
}

function throttleFunction<T>(
  limit: number,
  funcs: Array<() => Promise<T>>,
  hook: Function
): Promise<T[]> {
  return new Promise((resolve) => {
    async function startNext() {
      const all: Promise<T>[] = [];
      const next = funcs.shift();

      if (next !== undefined) {
        console.log("Starting Next Function");
        const wait = next();
        wait.then((data) => {
          hook(data);
          startNext();
        });
        all.push(wait);
      } else {
        console.log("no more Functions");
        const allData = await Promise.all(all);
        console.log("All functions done");
        resolve(allData);
      }
    }
    for (let i = 0; i < limit; i++) {
      startNext();
    }
  });
}
