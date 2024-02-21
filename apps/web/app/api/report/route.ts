import { Recipe } from "@/lib/Finder";
import { decompressRecipes } from "@/lib/compression";
import { kv } from "@vercel/kv";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request: Request) {
  const body = await request.json();
  const { item, path } = body as { item: string; path: Recipe[] };

  const client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: "recipes.json",
  });
  const response = await client.send(command);

  if (!response.Body) {
    return new Response("Failed to load recipes", { status: 500 });
  }

  const textData = await response.Body.transformToString();
  const data = JSON.parse(textData);
  const recipes = decompressRecipes(data);

  const allRecipesValid = path.every((recipe) => {
    return recipes.find(
      (r) =>
        r.first === recipe.first &&
        r.second === recipe.second &&
        r.result === recipe.result
    );
  });
  const finalItemCorrect = path[path.length - 1]!.result === item;

  if (
    allRecipesValid &&
    finalItemCorrect &&
    path.length > 1 &&
    path.length < 200
  ) {
    const cachePath = `recipe-${item}`;
    await kv.set(cachePath, path, { ex: 60 * 60 * 48 });

    return new Response("ok", { status: 200 });
  }

  return new Response("Invalid path", { status: 400 });
}
