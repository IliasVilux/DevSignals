import { schedule } from "node-cron";
import { ingestAll } from "./ingest";
import { prisma } from "../lib/prisma";
import { getRedis } from "../lib/redis";

const RETENTION_DAYS = 30;

async function invalidateMarketCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const pattern = "market:overview:*";
  let cursor = "0";
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
      deleted += keys.length;
    }
  } while (cursor !== "0");

  console.log(`[cache] invalidated ${deleted} market:overview keys`);
}

export async function cleanupOldJobs(): Promise<void> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const result = await prisma.job.deleteMany({
    where: { postedAt: { lt: cutoff } },
  });

  console.log(
    `Cleanup: deleted ${result.count} jobs older than ${RETENTION_DAYS} days`
  );
}

export function startScheduler(): void {
  // Daily ingest at 3:00 AM
  schedule("0 3 * * *", async () => {
    console.log("Scheduler: starting daily ingest...");
    try {
      await ingestAll();
      await invalidateMarketCache();
    } catch (err) {
      console.error("Scheduler: daily ingest failed:", err);
    }
  });

  // Weekly cleanup every Sunday at 4:00 AM
  schedule("0 4 * * 0", async () => {
    console.log("Scheduler: starting weekly cleanup...");
    try {
      await cleanupOldJobs();
    } catch (err) {
      console.error("Scheduler: weekly cleanup failed:", err);
    }
  });

  console.log(
    "Scheduler: registered daily ingest (3am) and weekly cleanup (Sunday 4am)"
  );
}
