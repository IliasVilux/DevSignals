import { TopRoles } from "../jobs/jobs.types";

export interface MarketOverviewFilters {
    countryCode?: string;
    role?: string;
}

export interface RemoteDistrubution {
    remote: number; // Percentage of remote jobs
    hybrid: number; // Percentage of hybrid jobs
    onsite: number; // Percentage of on-site jobs
}

export interface MarketOverview {
    totalJobs: number;
    averageSalary: number | null; // Average salary can be null if not available
    remoteDistribution: RemoteDistrubution;
    topRoles: TopRoles[];
}