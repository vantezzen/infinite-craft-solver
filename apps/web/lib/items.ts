import { sql } from "@vercel/postgres";
import redis from "./kv";

export async function getItemList() {
  const cachePath = "item-list";
  const cached = await redis.get<string[]>(cachePath);
  if (cached) {
    return cached;
  }

  const items = await sql<{ result: string }>`
    SELECT DISTINCT result FROM "Recipe"
  `;

  const itemNames = items.rows
    .map((item) => item.result)
    .filter((item) => item !== "Nothing");

  await redis.set(cachePath, itemNames, {
    ex: 60 * 60 * 24,
  });
  return itemNames;
}
