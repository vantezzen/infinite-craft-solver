import redis from "@/lib/kv";

export async function GET(
  request: Request,
  { params: { item } }: { params: { item: string } }
) {
  const cachePath = `recipe-${item}`;
  const path = await redis.get<string>(cachePath);
  return path ? Response.json(path) : new Response(null, { status: 404 });
}
