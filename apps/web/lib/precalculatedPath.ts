import { Recipe } from "./Finder";
import redis from "./kv";

export async function getPrecalculatedPath(item: string) {
  const cachePath = `recipe-${item}`;
  return await redis.get<Recipe[]>(cachePath);
}
