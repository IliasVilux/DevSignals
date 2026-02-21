import { prisma } from "../../lib/prisma";
import { NormalizedJob } from "../../ingestion/job-normalizer";

export class JobsRepository {
    async createMany(jobs: NormalizedJob[]) {
        if (jobs.length === 0) return;

        const countryCodes = [...new Set(jobs.map(j => j.countryCode))];

        const countries = await prisma.country.findMany({
            where: { code: { in: countryCodes } }
        });

        const countryMap = new Map(
            countries.map(c => [c.code, c.id])
        );

        const data = jobs.map(j => ({
            externalId: j.externalId,
            role: j.role,
            company: j.company ?? null,
            salaryMin: j.salaryMin ?? null,
            salaryMax: j.salaryMax ?? null,
            remoteType: j.remoteType,
            postedAt: j.postedAt,
            countryId: countryMap.get(j.countryCode)!
        }))

        return prisma.job.createMany({
            data,
            skipDuplicates: true
        })
    }
}