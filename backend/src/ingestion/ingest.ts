import { fetchJobsFromAdzuna } from "./adzuna.client";
import { normalizeJob } from "./job-normalizer";
import { JobsRepository } from "../modules/jobs/jobs.repository";
import { prisma } from "../lib/prisma";

const jobsRepository = new JobsRepository();

export async function ingestCountry(countryCode: string): Promise<void> {
  console.log(`Ingesting jobs for ${countryCode}...`);

  const rawJobs = await fetchJobsFromAdzuna(countryCode, 1);
  const normalized = rawJobs.map((j) => normalizeJob(j, countryCode));
  await jobsRepository.createMany(normalized);

  await prisma.country.update({
    where: { code: countryCode },
    data: { lastIngestedAt: new Date() },
  });

  console.log(`Ingested ${normalized.length} jobs for ${countryCode}`);
}

export async function ingestAll(): Promise<void> {
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    try {
      await ingestCountry(country.code);
    } catch (err) {
      console.error(`Error ingesting jobs for ${country.code}:`, err);
    }
  }
}
