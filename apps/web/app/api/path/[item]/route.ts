import redis from "@/lib/kv";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  const { item } = await params;
  const cachePath = `recipe-${item}`;
  const path = await redis.get<string>(cachePath);
  return path ? Response.json(path) : new Response(null, { status: 404 });
}
