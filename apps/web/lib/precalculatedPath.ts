import { kv } from "@vercel/kv";
import { Recipe } from "./Finder";

export async function getPrecalculatedPath(item: string) {
  const cachePath = `recipe-${item}`;
  return await kv.get<Recipe[]>(cachePath);
}
