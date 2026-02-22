import { describe, it, expect, vi, beforeEach } from "vitest"
import { JobsRepository } from "../../../modules/jobs/jobs.repository"
import { prisma } from "../../../lib/prisma"
import { NormalizedJob } from "../../../modules/jobs/jobs.types"
import { Country } from "../../../modules/countries/countries.types"

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    country: {
      findMany: vi.fn(),
    },
    job: {
      createMany: vi.fn(),
    },
  },
}))

describe("JobsRepository", () => {
    const repo = new JobsRepository();

    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("inserts a job correctly", async () => {
        const jobs = [
            {
                externalId: "123",
                role: "Software Engineer",
                company: "Tech Co",
                salaryMin: 50000,
                salaryMax: 100000,
                remoteType: "REMOTE",
                postedAt: new Date("2024-01-01T00:00:00Z"),
                countryCode: "US",
            }
        ]

        vi.mocked(prisma.country.findMany).mockResolvedValue([{ id: "1", code: "US", name: "United States" }] as Country[]);
        vi.mocked(prisma.job.createMany).mockResolvedValue({ count: 1 });

        const result = await repo.createMany(jobs as NormalizedJob[]);
        
        expect(prisma.country.findMany).toHaveBeenCalledWith({ where: { code: { in: ["US"] } } });
        expect(prisma.job.createMany).toHaveBeenCalled();
        expect(result).toEqual({ count: 1 });

        const callArgs = vi.mocked(prisma.job.createMany).mock.calls[0][0]

        expect(callArgs.skipDuplicates).toBe(true)
        expect(callArgs.data).toHaveLength(1)
    })
})