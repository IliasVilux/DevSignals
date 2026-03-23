import { describe, it, expect, vi } from "vitest";
import { MarketService } from "../../../modules/market/market.service";
import { RemoteType, SkillCategory } from "../../../../generated/prisma/client";

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
    },
  ];

  const baseRepository = () => ({
    findJobs: vi.fn().mockResolvedValue(mockJobs),
    findTopRoles: vi.fn().mockResolvedValue([]),
    findTopSkills: vi.fn().mockResolvedValue([]),
    findSkillCategoryBreakdown: vi.fn().mockResolvedValue([]),
  });

  it("returns empty overview when no jobs found", async () => {
    const mockRepository = {
      ...baseRepository(),
      findJobs: vi.fn().mockResolvedValue([]),
    };
    const service = new MarketService(mockRepository);
    const result = await service.getMarketOverview({});

    expect(result).toEqual({
      totalJobs: 0,
      averageSalary: null,
      remoteDistribution: { remote: 0, hybrid: 0, onsite: 0 },
      topRoles: [],
      topSkills: [],
      skillCategoryBreakdown: [],
    });
  });

  it("calculates average salary correctly", async () => {
    const service = new MarketService(baseRepository());
    const result = await service.getMarketOverview({});

    // Average salary = (60000 + 70000 + 90000) / 3 = 73333
    expect(result.averageSalary).toBe(73333);
  });

  it("calculates remote distribution correctly", async () => {
    const extendedMockJobs = [
      ...mockJobs,
      {
        id: "4",
        externalId: "ext4",
        role: "DevOps",
        company: "Company D",
        salaryMin: 50000,
        salaryMax: 60000,
        remoteType: RemoteType.REMOTE,
        postedAt: new Date(),
        countryId: "country1",
        createdAt: new Date(),
      },
    ];
    const mockRepository = {
      ...baseRepository(),
      findJobs: vi.fn().mockResolvedValue(extendedMockJobs),
    };

    const service = new MarketService(mockRepository);
    const result = await service.getMarketOverview({});

    // Remote: 2/4, Hybrid: 1/4, OnSite: 1/4
    expect(result.remoteDistribution).toEqual({
      remote: 50,
      hybrid: 25,
      onsite: 25,
    });
  });

  it("returns top roles from repository", async () => {
    const mockRepository = {
      ...baseRepository(),
      findTopRoles: vi.fn().mockResolvedValue([
        { role: "Software Engineer", count: 2, avgSalary: 65000 },
        { role: "Frontend Dev", count: 1, avgSalary: null },
      ]),
    };
    const service = new MarketService(mockRepository);
    const result = await service.getMarketOverview({});

    expect(result.topRoles).toHaveLength(2);
    expect(result.topRoles[0].count).toBeGreaterThanOrEqual(
      result.topRoles[1].count
    );
  });

  it("returns top skills from repository", async () => {
    const mockSkills = [
      { name: "TypeScript", category: SkillCategory.LANGUAGE, count: 10 },
      { name: "React", category: SkillCategory.FRAMEWORK, count: 7 },
      { name: "PostgreSQL", category: SkillCategory.DATABASE, count: 4 },
    ];
    const mockRepository = {
      ...baseRepository(),
      findTopSkills: vi.fn().mockResolvedValue(mockSkills),
    };

    const service = new MarketService(mockRepository);
    const result = await service.getMarketOverview({});

    expect(result.topSkills).toHaveLength(3);
    expect(result.topSkills[0]).toEqual({
      name: "TypeScript",
      category: SkillCategory.LANGUAGE,
      count: 10,
    });
    expect(result.topSkills[0].count).toBeGreaterThanOrEqual(
      result.topSkills[1].count
    );
  });

  it("returns skills by category with computed percentages and skills array", async () => {
    const mockRepository = {
      ...baseRepository(),
      findSkillCategoryBreakdown: vi.fn().mockResolvedValue([
        {
          category: SkillCategory.FRAMEWORK,
          count: 50,
          skills: [
            { name: "React", category: SkillCategory.FRAMEWORK, count: 30 },
          ],
        },
        {
          category: SkillCategory.LANGUAGE,
          count: 30,
          skills: [
            { name: "TypeScript", category: SkillCategory.LANGUAGE, count: 30 },
          ],
        },
        {
          category: SkillCategory.DATABASE,
          count: 20,
          skills: [
            { name: "PostgreSQL", category: SkillCategory.DATABASE, count: 20 },
          ],
        },
      ]),
    };

    const service = new MarketService(mockRepository);
    const result = await service.getMarketOverview({});

    expect(result.skillCategoryBreakdown).toHaveLength(3);
    expect(result.skillCategoryBreakdown[0]).toEqual({
      category: SkillCategory.FRAMEWORK,
      count: 50,
      percentage: 50,
      skills: [{ name: "React", category: SkillCategory.FRAMEWORK, count: 30 }],
    });
    expect(result.skillCategoryBreakdown[1]).toEqual({
      category: SkillCategory.LANGUAGE,
      count: 30,
      percentage: 30,
      skills: [
        { name: "TypeScript", category: SkillCategory.LANGUAGE, count: 30 },
      ],
    });
    expect(result.skillCategoryBreakdown[2]).toEqual({
      category: SkillCategory.DATABASE,
      count: 20,
      percentage: 20,
      skills: [
        { name: "PostgreSQL", category: SkillCategory.DATABASE, count: 20 },
      ],
    });
  });
});
