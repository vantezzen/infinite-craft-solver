import { kv } from "@vercel/kv";

export async function getPrecalculatedPath(item: string) {
  const cachePath = `recipe-${item}`;
  return await kv.get<string>(cachePath);
}
