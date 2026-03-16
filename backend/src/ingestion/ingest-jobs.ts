import { ingestCountry, ingestAll } from "./ingest";

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

async function main() {
  const { countryCode, maxDaysOld } = parseArgs();

  if (countryCode) {
    await ingestCountry(countryCode, { maxDaysOld });
    return;
  }

  await ingestAll({ maxDaysOld });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
