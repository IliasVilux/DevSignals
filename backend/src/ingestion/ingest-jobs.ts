import { ingestCountry, ingestAll } from "./ingest";

async function main() {
  const countryCode = process.argv[2];
  if (countryCode) {
    await ingestCountry(countryCode);
    return;
  }

  await ingestAll();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
