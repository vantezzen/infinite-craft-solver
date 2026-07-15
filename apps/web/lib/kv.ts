import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | undefined;
let connection: Promise<RedisClient>;

async function getClient() {
  if (!client) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL is not configured");
    }

    client = createClient({ url });
    client.on("error", (error) => console.error("Redis client error", error));
    connection = client.connect();
  }

  await connection;
  return client;
}

const redis = {
  async get<T>(key: string): Promise<T | null> {
    const value = await (await getClient()).get(key);
    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  async set(key: string, value: unknown, options?: { ex?: number }) {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);

    if (serialized === undefined) {
      throw new TypeError("Redis values must be JSON-serializable");
    }

    return (await getClient()).set(
      key,
      serialized,
      options?.ex
        ? { expiration: { type: "EX", value: options.ex } }
        : undefined
    );
  },
};

export default redis;
