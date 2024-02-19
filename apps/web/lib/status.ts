import { sql } from "@vercel/postgres";

export default async function getStatus() {
  const recipeInfo = await sql<{ count: number }>`
    SELECT COUNT(*) FROM "Recipe"
  `;
  const recipes = recipeInfo.rows[0]!.count;

  const itemInfo = await sql<{ result: string }>`
    SELECT DISTINCT result FROM "Recipe"
  `;
  const items = itemInfo.rows.length;

  const queuedInfo = await sql<{ count: number }>`
    SELECT COUNT(*) FROM "QueueItem"
  `;
  const queued = queuedInfo.rows[0]!.count;

  return {
    recipes,
    items: items,
    queued,
  };
}
