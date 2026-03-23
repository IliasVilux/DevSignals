import { ingestCountry, ingestAll } from "./ingest";
import { getRedis } from "../lib/redis";

function parseArgs() {
  const args = process.argv.slice(2);
  let countryCode: string | undefined;
  let maxDaysOld = 7;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--max-days-old") {
      const next = args[i + 1];
      if (!next) {
        throw new Error("Missing value for --max-days-old");
      }

      const parsed = Number.parseInt(next, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error("--max-days-old must be a positive integer");
      }

      maxDaysOld = parsed;
      i += 1;
      continue;
    }

    if (arg.startsWith("--max-days-old=")) {
      const value = arg.split("=")[1];
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        throw new Error("--max-days-old must be a positive integer");
      }

      maxDaysOld = parsed;
      continue;
    }

    if (!arg.startsWith("--")) {
      countryCode = arg;
    }
  }

  return { countryCode, maxDaysOld };
}

async function invalidateMarketCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const pattern = "market:overview:*";
  let cursor = "0";
  let deleted = 0;

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100
    );
    cursor = nextCursor;
    if (keys.length > 0) {
      await redis.del(...keys);
      deleted += keys.length;
    }
  } while (cursor !== "0");

  console.log(`[cache] invalidated ${deleted} market:overview keys`);
}

async function main() {
  const { countryCode, maxDaysOld } = parseArgs();

  if (countryCode) {
    await ingestCountry(countryCode, { maxDaysOld });
  } else {
    await ingestAll({ maxDaysOld });
  }

  await invalidateMarketCache();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
