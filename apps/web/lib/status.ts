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

  const recipesInPastHourInfo = await sql<{ count: number }>`
    SELECT COUNT(*) FROM "Recipe" WHERE "createdAt" > NOW() - INTERVAL '1 hour'
  `;
  const recipesInPastHour = recipesInPastHourInfo.rows[0]!.count;

  const queuedPastHourInfo = await sql<{ count: number }>`
    SELECT COUNT(*) FROM "QueueItem" WHERE "createdAt" > NOW() - INTERVAL '1 hour'
  `;
  const queuedPastHour = queuedPastHourInfo.rows[0]!.count;

  return {
    recipes,
    items: items,
    queued,
    recipesInPastHour,
    queuedPastHour,
  };
}
