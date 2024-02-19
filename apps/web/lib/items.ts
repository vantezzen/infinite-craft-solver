import { sql } from "@vercel/postgres";

export async function getItemList() {
  const items = await sql<{ result: string }>`
    SELECT DISTINCT result FROM "Recipe"
  `;

  return items.rows
    .map((item) => item.result)
    .filter((item) => item !== "Nothing");
}
