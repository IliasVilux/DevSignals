import { IJobsRepository } from "../jobs/jobs.repository";
import { MarketOverview, MarketOverviewFilters } from "./market.types";
import { RemoteType } from "../../../generated/prisma/client";

export class MarketService {
  constructor(private jobsRepository: IJobsRepository) {}

  async getMarketOverview(
    filters: MarketOverviewFilters
  ): Promise<MarketOverview> {
    const jobs = await this.jobsRepository.findJobs(filters);
    const totalJobs = jobs.length;

    if (totalJobs === 0) {
      return {
        totalJobs: 0,
        averageSalary: null,
        remoteDistribution: {
          remote: 0,
          hybrid: 0,
          onsite: 0,
        },
        topRoles: [],
        topSkills: [],
        skillCategoryBreakdown: [],
      };
    }

    const totalSalary = jobs.reduce((acc, job) => {
      const jobSalary =
        job.salaryMin != null && job.salaryMax != null
          ? (job.salaryMin + job.salaryMax) / 2
          : (job.salaryMin ?? job.salaryMax ?? 0);

      return acc + jobSalary;
    }, 0);

    const avgSalary = Math.round(totalSalary / totalJobs);

    const remoteCount = jobs.filter(
      (j) => j.remoteType === RemoteType.REMOTE
    ).length;
    const hybridCount = jobs.filter(
      (j) => j.remoteType === RemoteType.HYBRID
    ).length;
    const onsiteCount = jobs.filter(
      (j) => j.remoteType === RemoteType.ONSITE
    ).length;

    const [topRoles, topSkills, rawSkillsByCategory] = await Promise.all([
      this.jobsRepository.findTopRoles(filters, 5),
      this.jobsRepository.findTopSkills(filters, 10),
      this.jobsRepository.findSkillCategoryBreakdown(filters),
    ]);

    const skillsTotal = rawSkillsByCategory.reduce((sum, r) => sum + r.count, 0);
    const skillCategoryBreakdown = rawSkillsByCategory.map((r) => ({
      ...r,
      percentage: skillsTotal > 0 ? Math.round((r.count / skillsTotal) * 100) : 0,
    }));

    return {
      totalJobs,
      averageSalary: avgSalary,
      remoteDistribution: {
        remote: Math.round((remoteCount / totalJobs) * 100),
        hybrid: Math.round((hybridCount / totalJobs) * 100),
        onsite: Math.round((onsiteCount / totalJobs) * 100),
      },
      topRoles,
      topSkills,
      skillCategoryBreakdown,
    };
  }
}
