import type { Recipe } from "@/lib/Finder";
import { compressRecipes } from "@/lib/compression";
import { sql } from "@vercel/postgres";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "edge";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const encoder = new TextEncoder();
  const streamResponse = new ReadableStream({
    async start(controller) {
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode("."));
      }, 1000);
      const timeout = setTimeout(() => {
        clearInterval(keepAlive);
        controller.enqueue(encoder.encode("TIMEOUT"));
        controller.close();
      }, 60000);

      const recipes: Recipe[] = [];
      let offset = 0;
      const limit = 10000;
      let hasMore = true;

      while (hasMore) {
        const recipeResult = await sql<Recipe>`
      SELECT * FROM "Recipe"
      ORDER BY result
      LIMIT ${limit} OFFSET ${offset}
    `;
        if (recipeResult.rows.length > 0) {
          recipes.push(
            ...recipeResult.rows.map((row) => ({
              first: row.first,
              second: row.second,
              result: row.result,
            }))
          );
          offset += recipeResult.rows.length;
        } else {
          hasMore = false;
        }
      }

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

      clearInterval(keepAlive);
      clearTimeout(timeout);
      controller.close();
    },
  });
  return new Response(streamResponse);
}
