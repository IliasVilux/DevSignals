import { fetchJobsFromAdzuna } from "./adzuna.client";
import { normalizeJob } from "./job-normalizer";
import { JobsRepository } from "../modules/jobs/jobs.repository";

const jobsRepository = new JobsRepository()

async function ingestCountry(countryCode: string) {
    console.log(`Ingesting jobs for ${countryCode}...`)

    const rawJobs = await fetchJobsFromAdzuna(countryCode, 1)
    const normalized = rawJobs.map(j => normalizeJob(j, countryCode))
    const result = await jobsRepository.createMany(normalized)

    console.log(`Inserted ${result?.count} new jobs`);
}

async function main() {
    await ingestCountry("ES")
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})