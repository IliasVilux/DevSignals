import { IJobsRepository } from "../jobs/jobs.repository";
import { MarketOverview, MarketOverviewFilters } from "./market.types";
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

    const [stats, topRoles, topSkills, rawSkillsByCategory] = await Promise.all(
      [
        this.jobsRepository.findJobStats(filters),
        this.jobsRepository.findTopRoles(filters, 5),
        this.jobsRepository.findTopSkills(filters, 10),
        this.jobsRepository.findSkillCategoryBreakdown(filters),
      ]
    );

    if (stats.totalJobs === 0) {
      return {
        totalJobs: 0,
        averageSalary: null,
        remoteDistribution: { hybrid: 0, remote: 0, onsite: 0 },
        topRoles: [],
        topSkills: [],
        skillCategoryBreakdown: [],
      };
    }

    const result: MarketOverview = {
      totalJobs: stats.totalJobs,
      averageSalary: stats.averageSalary,
      remoteDistribution: stats.remoteDistribution,
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
