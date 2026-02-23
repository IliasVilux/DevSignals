import { prisma } from "../../lib/prisma";
import { MarketOverviewFilters } from "../market/market.types";
import { NormalizedJob } from "./jobs.types";
import { Job } from "@prisma/client";

export interface IJobsRepository {
  findJobs(filters?: MarketOverviewFilters): Promise<Job[]>;
}

export class JobsRepository implements IJobsRepository {
    async createMany(jobs: NormalizedJob[]) {
        if (jobs.length === 0) return;

        const countryCodes = [...new Set(jobs.map(j => j.countryCode))];

        const countries = await prisma.country.findMany({
            where: { code: { in: countryCodes } }
        });

        const countryMap = new Map(
            countries.map(c => [c.code, c.id])
        );
        

        const data = jobs.map(j => {
            const countryId = countryMap.get(j.countryCode);
            if (!countryId) {
                throw new Error(`Country code ${j.countryCode} not found in database`);
            }
            
            return {
                externalId: j.externalId,
                role: j.role,
                description: j.description ?? null,
                company: j.company ?? null,
                salaryMin: j.salaryMin ?? null,
                salaryMax: j.salaryMax ?? null,
                remoteType: j.remoteType,
                postedAt: j.postedAt,
                countryId: countryMap.get(j.countryCode)!
            }
        })

        return prisma.job.createMany({
            data,
            skipDuplicates: true
        })
    }

    async findJobs(filters: MarketOverviewFilters): Promise<Job[]> {
        return prisma.job.findMany({
            where: {
                country: filters.countryCode ? { code: filters.countryCode.toUpperCase() } : undefined,
                role: filters.role ? { contains: filters.role.toLowerCase(), mode: "insensitive" } : undefined,
            },
            include: {
                country: true
            }
        })
    }
}