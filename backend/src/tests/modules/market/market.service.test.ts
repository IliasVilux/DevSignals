import { describe, it, expect, vi } from "vitest"
import { MarketService } from "../../../modules/market/market.service"
import { RemoteType } from "@prisma/client"

describe("MarketService", () => {
    const mockJobs = [
        {
            id: "1",
            externalId: "ext1",
            role: "Frontend Dev",
            company: "Company A",
            salaryMin: 50000,
            salaryMax: 70000,
            remoteType: RemoteType.REMOTE,
            postedAt: new Date(),
            countryId: "country1",
            createdAt: new Date(),
        },
        {
            id: "2",
            externalId: "ext2",
            role: "Backend Dev",
            company: "Company B",
            salaryMin: 60000,
            salaryMax: 80000,
            remoteType: RemoteType.HYBRID,
            postedAt: new Date(),
            countryId: "country1",
            createdAt: new Date(),
        },
        {
            id: "3",
            externalId: "ext3",
            role: "DevOps",
            company: "Company C",
            salaryMin: null,
            salaryMax: 90000,
            remoteType: RemoteType.ONSITE,
            postedAt: new Date(),
            countryId: "country1",
            createdAt: new Date(),
        }
    ];

    it("returns empty overview when no jobs found", async () => {
        const mockRepository = {
            findJobs: vi.fn().mockResolvedValue([]),
            findTopRoles: vi.fn().mockResolvedValue([])
        }
        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        expect(result).toEqual({
            totalJobs: 0,
            averageSalary: null,
            remoteDistribution: {
                remote: 0,
                hybrid: 0,
                onsite: 0,
            },
            topRoles: [],
        });
    })

    it("calculates avarage salary correctly", async () => {
        const mockRepository = {
            findJobs: vi.fn().mockResolvedValue(mockJobs),
            findTopRoles: vi.fn().mockResolvedValue([])
        }

        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        // Average salary = (60000 + 70000 + 90000) / 3 = 73333
        expect(result.averageSalary).toBe(73333);
    })

    it("calculates remote distribution correctly", async () => {
        const extendedMockJobs = [...mockJobs, {
            id: "4",
            externalId: "ext4",
            role: "DevOps",
            company: "Company D",
            salaryMin: 50000,
            salaryMax: 60000,
            remoteType: RemoteType.REMOTE ,
            postedAt: new Date(),
            countryId: "country1",
            createdAt: new Date(),
        }];
        const mockRepository = {
            findJobs: vi.fn().mockResolvedValue(extendedMockJobs),
            findTopRoles: vi.fn().mockResolvedValue([])
        }

        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        // Remote: 2/4, Hybrid: 1/4, OnSite: 1/4
        expect(result.remoteDistribution).toEqual({
            remote: 50,
            hybrid: 25,
            onsite: 25,
        });
    });

    it("returns top roles normalized (same role in different casing counts as one)", async () => {
        const jobsWithSameRole = [
            { ...mockJobs[0], role: "Software Engineer" },
            { ...mockJobs[1], role: "software engineer" },
            { ...mockJobs[2], role: "Frontend Dev" },
        ];

        const mockRepository = {
            findJobs: vi.fn().mockResolvedValue(jobsWithSameRole),
            findTopRoles: vi.fn().mockResolvedValue([
                { role: "Software Engineer", count: 2 },
                { role: "Frontend Dev", count: 1 }
            ])
        }
        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        expect(result.topRoles).toHaveLength(2);
        const softwareEngineer = result.topRoles.find((r) => r.role.toLowerCase() === "software engineer");
        const frontendDev = result.topRoles.find((r) => r.role.toLowerCase() === "frontend dev");
        expect(softwareEngineer?.count).toBe(2);
        expect(frontendDev?.count).toBe(1);
        expect(result.topRoles[0].count).toBeGreaterThanOrEqual(result.topRoles[1].count);
    });
});