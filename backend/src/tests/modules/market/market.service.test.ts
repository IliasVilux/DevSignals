import { describe, it, expect, vi, beforeEach } from "vitest"
import { MarketService } from "../../../modules/market/market.service"
import { RemoteType } from "@prisma/client"
import { mock } from "node:test";

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
            findJobs: vi.fn().mockResolvedValue([])
        }
        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        expect(result).toEqual({
            totalJobs: 0,
            averageSalary: null,
            remoteDistribution: {
                remote: 0,
                hybrid: 0,
                onSite: 0,
            },
        });
    })

    it("calculates avarage salary correctly", async () => {
        const mockRepository = {
            findJobs: vi.fn().mockResolvedValue(mockJobs)
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
            findJobs: vi.fn().mockResolvedValue(extendedMockJobs)
        }

        const service = new MarketService(mockRepository);
        const result = await service.getMarketOverview({});

        // Remote: 2/4, Hybrid: 1/4, OnSite: 1/4
        expect(result.remoteDistribution).toEqual({
            remote: 50,
            hybrid: 25,
            onSite: 25,
        });
    })
})