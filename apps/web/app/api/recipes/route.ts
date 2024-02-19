import { sql } from "@vercel/postgres";
import { kv } from "@vercel/kv";

interface Recipe {
  first: string;
  second: string;
  result: string;
}

export async function GET() {
  const recipeResult = await sql<Recipe>`
    SELECT * FROM "Recipe"
    ORDER BY result
  `;

  const recipes = recipeResult.rows.map((row) => ({
    first: row.first,
    second: row.second,
    result: row.result,
  }));
  return Response.json(recipes);
}
