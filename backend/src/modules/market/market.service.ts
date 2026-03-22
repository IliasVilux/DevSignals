import { IJobsRepository } from "../jobs/jobs.repository";
import { MarketOverview, MarketOverviewFilters } from "./market.types";
import { RemoteType } from "../../../generated/prisma/client";
import { getRedis } from "../../lib/redis";
import type { SkillCategoryBreakdown } from "./market.types";
import type { SkillCategoryBreakdown as RawSkillCategoryBreakdown } from "../jobs/jobs.types";

const CACHE_TTL = 7200; // 2 hours in seconds

function buildCacheKey(filters: MarketOverviewFilters): string {
  const cc = filters.countryCode ?? "all";
  const role = filters.role ?? "all";
  return `market:overview:${cc}:${role}`;
}

export class MarketService {
  constructor(private jobsRepository: IJobsRepository) {}

  async getMarketOverview(
    filters: MarketOverviewFilters
  ): Promise<MarketOverview> {
    const redis = getRedis();
    const key = buildCacheKey(filters);

    if (redis) {
      try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached) as MarketOverview;
      } catch (err) {
        console.warn("[cache] read failed, falling back to DB:", err);
      }
    }

    const jobs = await this.jobsRepository.findJobs(filters);
    const totalJobs = jobs.length;

    if (totalJobs === 0) {
      return {
        totalJobs: 0,
        averageSalary: null,
        remoteDistribution: { hybrid: 0, remote: 0, onsite: 0 },
        topRoles: [],
        topSkills: [],
        skillCategoryBreakdown: [],
      };
    }

    const [topRoles, topSkills, rawSkillsByCategory] = await Promise.all([
      this.jobsRepository.findTopRoles(filters, 5),
      this.jobsRepository.findTopSkills(filters, 10),
      this.jobsRepository.findSkillCategoryBreakdown(filters),
    ]);

    const result: MarketOverview = {
      totalJobs,
      averageSalary: this.calculateAverageSalary(jobs, totalJobs),
      remoteDistribution: this.calculateRemoteDistribution(jobs, totalJobs),
      topRoles,
      topSkills,
      skillCategoryBreakdown:
        this.calculateSkillCategoryBreakdown(rawSkillsByCategory),
    };

    if (redis) {
      redis
        .set(key, JSON.stringify(result), "EX", CACHE_TTL)
        .catch((err) => console.warn("[cache] write failed:", err));
    }

    return result;
  }

  private calculateAverageSalary(
    jobs: { salaryMin: number | null; salaryMax: number | null }[],
    totalJobs: number
  ): number {
    const total = jobs.reduce((acc, job) => {
      const salary =
        job.salaryMin != null && job.salaryMax != null
          ? (job.salaryMin + job.salaryMax) / 2
          : (job.salaryMin ?? job.salaryMax ?? 0);
      return acc + salary;
    }, 0);

    return Math.round(total / totalJobs);
  }

  private calculateRemoteDistribution(
    jobs: { remoteType: RemoteType }[],
    totalJobs: number
  ): MarketOverview["remoteDistribution"] {
    const hybrid = jobs.filter(
      (j) => j.remoteType === RemoteType.HYBRID
    ).length;
    const remote = jobs.filter(
      (j) => j.remoteType === RemoteType.REMOTE
    ).length;
    const onsite = jobs.filter(
      (j) => j.remoteType === RemoteType.ONSITE
    ).length;

    return {
      hybrid: Math.round((hybrid / totalJobs) * 100),
      remote: Math.round((remote / totalJobs) * 100),
      onsite: Math.round((onsite / totalJobs) * 100),
    };
  }

  private calculateSkillCategoryBreakdown(
    raw: RawSkillCategoryBreakdown[]
  ): SkillCategoryBreakdown[] {
    const total = raw.reduce((sum, r) => sum + r.count, 0);

    return raw.map((r) => ({
      ...r,
      percentage: total > 0 ? Math.round((r.count / total) * 100) : 0,
    }));
  }
}
