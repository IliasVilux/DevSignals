import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobsRepository } from "../../../modules/jobs/jobs.repository";
import { prisma } from "../../../lib/prisma";
import { NormalizedJob } from "../../../modules/jobs/jobs.types";
import { Country } from "../../../modules/countries/countries.types";
import {
  RemoteType,
  SkillCategory,
  Job,
  Skill,
} from "../../../../generated/prisma/client";
import { MarketOverviewFilters } from "../../../modules/market/market.types";

type PersistedJobRef = Pick<Job, "id" | "externalId" | "countryId">;
type PersistedSkillRef = Pick<Skill, "id" | "name">;

vi.mock("../../../lib/prisma", () => ({
  prisma: {
    country: {
      findMany: vi.fn(),
    },
    job: {
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    skill: {
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    jobSkill: {
      createMany: vi.fn(),
    },
    $queryRawTyped: vi.fn(),
  },
}));

describe("JobsRepository", () => {
  const repo = new JobsRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a job with no skills correctly", async () => {
    const jobs: NormalizedJob[] = [
      {
        externalId: "123",
        role: "Software Engineer",
        description: "This is a software engineering job at Tech Co.",
        company: "Tech Co",
        salaryMin: 50000,
        salaryMax: 100000,
        remoteType: RemoteType.REMOTE,
        postedAt: new Date("2024-01-01T00:00:00Z"),
        countryCode: "US",
        skills: [],
      },
    ];

    vi.mocked(prisma.country.findMany).mockResolvedValue([
      { id: "1", code: "US", name: "United States" },
    ] as Country[]);
    vi.mocked(prisma.job.createMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.job.findMany).mockResolvedValue([]);

    await repo.createMany(jobs);

    expect(prisma.country.findMany).toHaveBeenCalledWith({
      where: { code: { in: ["US"] } },
    });
    expect(prisma.job.createMany).toHaveBeenCalled();

    const callArgs = vi.mocked(prisma.job.createMany).mock.calls[0]?.[0];
    expect(callArgs!.skipDuplicates).toBe(true);
    expect(callArgs!.data).toHaveLength(1);

    // No skills to process — skill tables should not be touched
    expect(prisma.skill.createMany).not.toHaveBeenCalled();
    expect(prisma.jobSkill.createMany).not.toHaveBeenCalled();
  });

  it("inserts skills and creates JobSkill links", async () => {
    const jobs: NormalizedJob[] = [
      {
        externalId: "456",
        role: "Frontend Developer",
        description: "React and TypeScript required",
        company: "Acme",
        salaryMin: null,
        salaryMax: null,
        remoteType: RemoteType.ONSITE,
        postedAt: new Date("2024-01-01T00:00:00Z"),
        countryCode: "GB",
        skills: [
          { name: "React", category: SkillCategory.FRAMEWORK },
          { name: "TypeScript", category: SkillCategory.LANGUAGE },
        ],
      },
    ];

    vi.mocked(prisma.country.findMany).mockResolvedValue([
      { id: "c1", code: "GB", name: "United Kingdom" },
    ] as Country[]);
    vi.mocked(prisma.job.createMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.job.findMany).mockResolvedValue([
      { id: "j1", externalId: "456", countryId: "c1" } as PersistedJobRef,
    ] as Job[]);
    vi.mocked(prisma.skill.createMany).mockResolvedValue({ count: 2 });
    vi.mocked(prisma.skill.findMany).mockResolvedValue([
      { id: "s1", name: "React" } as PersistedSkillRef,
      { id: "s2", name: "TypeScript" } as PersistedSkillRef,
    ] as Skill[]);
    vi.mocked(prisma.jobSkill.createMany).mockResolvedValue({ count: 2 });

    await repo.createMany(jobs);

    expect(prisma.skill.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        { name: "React", category: SkillCategory.FRAMEWORK },
        { name: "TypeScript", category: SkillCategory.LANGUAGE },
      ]),
      skipDuplicates: true,
    });

    expect(prisma.jobSkill.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        { jobId: "j1", skillId: "s1" },
        { jobId: "j1", skillId: "s2" },
      ]),
      skipDuplicates: true,
    });
  });

  it("findSkillCategoryBreakdown groups flat rows into categories with skills", async () => {
    vi.mocked(prisma.$queryRawTyped).mockResolvedValue([
      {
        name: "React",
        category: "FRAMEWORK",
        skill_count: 30,
        category_count: 42,
      },
      {
        name: "Vue",
        category: "FRAMEWORK",
        skill_count: 12,
        category_count: 42,
      },
      {
        name: "TypeScript",
        category: "LANGUAGE",
        skill_count: 38,
        category_count: 38,
      },
      { name: null, category: null, skill_count: null, category_count: null },
    ]);

    const filters: MarketOverviewFilters = {
      countryCode: "US",
      role: "engineer",
    };
    const result = await repo.findSkillCategoryBreakdown(filters);

    expect(prisma.$queryRawTyped).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      category: SkillCategory.FRAMEWORK,
      count: 42,
      skills: [
        { name: "React", category: SkillCategory.FRAMEWORK, count: 30 },
        { name: "Vue", category: SkillCategory.FRAMEWORK, count: 12 },
      ],
    });
    expect(result[1]).toEqual({
      category: SkillCategory.LANGUAGE,
      count: 38,
      skills: [
        { name: "TypeScript", category: SkillCategory.LANGUAGE, count: 38 },
      ],
    });
  });

  it("findSkillCategoryBreakdown returns empty array when no rows", async () => {
    vi.mocked(prisma.$queryRawTyped).mockResolvedValue([]);

    const result = await repo.findSkillCategoryBreakdown({});

    expect(prisma.$queryRawTyped).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(0);
  });
});
