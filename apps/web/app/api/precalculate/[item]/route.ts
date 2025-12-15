import redis from "@/lib/kv";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ item: string }> }
) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Precalculate is only available in dev environments", {
      status: 404,
    });
  }

  const { item } = await params;
  const data = await request.json();
  const { path } = data;
  const cachePath = `recipe-${item}`;
  await redis.set(cachePath, path, { ex: 60 * 60 * 48 });
  return new Response("ok");
}
