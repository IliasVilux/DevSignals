import { fetchJobsFromAdzuna } from "./adzuna.client";
import { normalizeJob } from "./job-normalizer";
import { JobsRepository } from "../modules/jobs/jobs.repository";
import { prisma } from "../lib/prisma";

const jobsRepository = new JobsRepository()

async function ingestCountry(countryCode: string) {
    try {
        console.log(`Ingesting jobs for ${countryCode}...`)

        const rawJobs = await fetchJobsFromAdzuna(countryCode, 1)
        const normalized = rawJobs.map(j => normalizeJob(j, countryCode))
        const result = await jobsRepository.createMany(normalized)

        console.log(`Inserted ${result?.count} new jobs`);
    } catch (err) {
        console.error(`Error ingesting jobs for ${countryCode}:`, err)
    }
}

async function main() {
    const countryCode = process.argv[2]
    if (countryCode) {
        await ingestCountry(countryCode)
        return
    }

    const countries = await prisma.country.findMany()
    for (const country of countries) {
        await ingestCountry(country.code)
    }
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})