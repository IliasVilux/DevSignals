import { prisma } from "../../lib/prisma";
import { MarketOverviewFilters } from "../market/market.types";
import { NormalizedJob, SkillsByCategory, TopRoles, TopSkill } from "./jobs.types";
import { Job, SkillCategory } from "../../../generated/prisma/client";
import { getSkillsByCategory, getTopRoles, getTopSkills } from "../../../generated/prisma/sql";

export interface IJobsRepository {
  findJobs(filters?: MarketOverviewFilters): Promise<Job[]>;
  findTopRoles(
    filters: MarketOverviewFilters,
    limit: number
  ): Promise<TopRoles[]>;
  findTopSkills(
    filters: MarketOverviewFilters,
    limit: number
  ): Promise<TopSkill[]>;
  findSkillsByCategory(
    filters: MarketOverviewFilters
  ): Promise<SkillsByCategory[]>;
}

export class JobsRepository implements IJobsRepository {
  async createMany(jobs: NormalizedJob[]) {
    if (jobs.length === 0) return;

    const countryCodes = [...new Set(jobs.map((j) => j.countryCode))];

    const countries = await prisma.country.findMany({
      where: { code: { in: countryCodes } },
    });

    const countryMap = new Map(countries.map((c) => [c.code, c.id]));

    const jobData = jobs.map((j) => {
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
        countryId,
      };
    });

    await prisma.job.createMany({ data: jobData, skipDuplicates: true });

    const persistedJobs = await prisma.job.findMany({
      where: {
        OR: jobs.map((j) => ({
          externalId: j.externalId,
          countryId: countryMap.get(j.countryCode)!,
        })),
      },
      select: { id: true, externalId: true, countryId: true },
    });

    const jobIdMap = new Map(
      persistedJobs.map((j) => [`${j.externalId}:${j.countryId}`, j.id])
    );

    const allSkills = jobs.flatMap((j) => j.skills);
    const uniqueSkills = [
      ...new Map(allSkills.map((s) => [s.name, s])).values(),
    ];

    if (uniqueSkills.length === 0) return;

    await prisma.skill.createMany({
      data: uniqueSkills.map((s) => ({ name: s.name, category: s.category })),
      skipDuplicates: true,
    });

    const persistedSkills = await prisma.skill.findMany({
      where: { name: { in: uniqueSkills.map((s) => s.name) } },
      select: { id: true, name: true },
    });

    const skillIdMap = new Map(persistedSkills.map((s) => [s.name, s.id]));

    const jobSkillData = jobs.flatMap((j) => {
      const jobId = jobIdMap.get(
        `${j.externalId}:${countryMap.get(j.countryCode)}`
      );
      if (!jobId) return [];

      return j.skills
        .filter((s) => skillIdMap.has(s.name))
        .map((s) => ({ jobId, skillId: skillIdMap.get(s.name)! }));
    });

    if (jobSkillData.length === 0) return;

    await prisma.jobSkill.createMany({
      data: jobSkillData,
      skipDuplicates: true,
    });
  }

  async findJobs(filters: MarketOverviewFilters): Promise<Job[]> {
    return prisma.job.findMany({
      where: {
        country: filters.countryCode
          ? { code: filters.countryCode.toUpperCase() }
          : undefined,
        role: filters.role
          ? { contains: filters.role.toLowerCase(), mode: "insensitive" }
          : undefined,
      },
      include: {
        country: true,
      },
    });
  }

  async findTopRoles(
    filters: MarketOverviewFilters,
    limit: number
  ): Promise<TopRoles[]> {
    const countryParam = filters.countryCode
      ? filters.countryCode.toUpperCase()
      : null;
    const roleParam = filters.role ?? null;

    const rows = await prisma.$queryRawTyped(
      getTopRoles(countryParam, roleParam, limit)
    );
    return rows.filter((r): r is TopRoles => r.role !== null);
  }

  async findTopSkills(
    filters: MarketOverviewFilters,
    limit: number
  ): Promise<TopSkill[]> {
    const countryParam = filters.countryCode
      ? filters.countryCode.toUpperCase()
      : null;
    const roleParam = filters.role ?? null;

    const rows = await prisma.$queryRawTyped(
      getTopSkills(countryParam, roleParam, limit)
    );

    return rows
      .filter(
        (r): r is { name: string; category: string; count: number } =>
          r.name !== null && r.category !== null && r.count !== null
      )
      .map((r) => ({ ...r, category: r.category as SkillCategory }));
  }

  async findSkillsByCategory(
    filters: MarketOverviewFilters
  ): Promise<SkillsByCategory[]> {
    const countryParam = filters.countryCode
      ? filters.countryCode.toUpperCase()
      : null;
    const roleParam = filters.role ?? null;

    const rows = await prisma.$queryRawTyped(
      getSkillsByCategory(countryParam, roleParam)
    );

    return rows
      .filter(
        (r): r is { category: string; count: number } =>
          r.category !== null && r.count !== null
      )
      .map((r) => ({ ...r, category: r.category as SkillCategory }));
  }
}
