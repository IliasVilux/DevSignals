import Redis from "ioredis";

let client: Redis | null = null;

export function getRedis(): Redis | null {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  client = new Redis(url, {
    maxRetriesPerRequest: 1,
  });

  client.on("error", (err) => {
    console.error("[redis] connection error:", err.message);
  });

  return client;
}
