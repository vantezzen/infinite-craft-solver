import type { Recipe } from "@/lib/Finder";
import { compressRecipes } from "@/lib/compression";
import { sql } from "@vercel/postgres";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const recipeResult = await sql<Recipe>`
    SELECT * FROM "Recipe"
    ORDER BY result
  `;

  const recipes = recipeResult.rows.map((row) => ({
    first: row.first,
    second: row.second,
    result: row.result,
  }));

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: "recipes.json",
    Body: JSON.stringify(compressRecipes(recipes)),
  });
  await client.send(command);

  return new Response("ok");
}
