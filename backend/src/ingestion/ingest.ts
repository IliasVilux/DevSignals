import { fetchJobsFromAdzuna } from "./adzuna.client";
import { normalizeJob } from "./job-normalizer";
import { JobsRepository } from "../modules/jobs/jobs.repository";
import { prisma } from "../lib/prisma";

const jobsRepository = new JobsRepository();

export interface IngestOptions {
  maxDaysOld?: number;
  maxPages?: number;
  resultsPerPage?: number;
}

const DEFAULT_MAX_DAYS_OLD = 7;
const DEFAULT_MAX_PAGES = 100;
const DEFAULT_RESULTS_PER_PAGE = 50;

export async function ingestCountry(
  countryCode: string,
  options: IngestOptions = {}
): Promise<void> {
  const maxDaysOld = options.maxDaysOld ?? DEFAULT_MAX_DAYS_OLD;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const resultsPerPage = options.resultsPerPage ?? DEFAULT_RESULTS_PER_PAGE;

  console.log(
    `Ingesting jobs for ${countryCode} (last ${maxDaysOld} days, up to ${maxPages} pages)...`
  );

  let totalIngested = 0;
  let page = 1;

  while (page <= maxPages) {
    const rawJobs = await fetchJobsFromAdzuna(countryCode, {
      page,
      resultsPerPage,
      maxDaysOld,
    });

    if (rawJobs.length === 0) {
      break;
    }

    const normalized = rawJobs.map((j) => normalizeJob(j, countryCode));
    await jobsRepository.createMany(normalized);
    totalIngested += normalized.length;

    if (rawJobs.length < resultsPerPage) {
      break;
    }

    page += 1;
  }

  await prisma.country.update({
    where: { code: countryCode },
    data: { lastIngestedAt: new Date() },
  });

  console.log(`Ingested ${totalIngested} jobs for ${countryCode}`);
}

export async function ingestAll(options: IngestOptions = {}): Promise<void> {
  const countries = await prisma.country.findMany();
  for (const country of countries) {
    try {
      await ingestCountry(country.code, options);
    } catch (err) {
      console.error(`Error ingesting jobs for ${country.code}:`, err);
    }
  }
}
