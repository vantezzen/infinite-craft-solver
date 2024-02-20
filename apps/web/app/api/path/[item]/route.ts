import { kv } from "@vercel/kv";

export async function GET(
  request: Request,
  { params: { item } }: { params: { item: string } }
) {
  const cachePath = `recipe-${item}`;
  const path = await kv.get<string>(cachePath);
  return path ? Response.json(path) : new Response(null, { status: 404 });
}
