import type { Recipe } from "@/lib/Finder";
import { compressRecipes } from "@/lib/compression";
import { sql } from "@vercel/postgres";

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
  return Response.json(compressRecipes(recipes));
}
