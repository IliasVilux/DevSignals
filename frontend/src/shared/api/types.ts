export type RemoteDistribution = {
  remote: number
  hybrid: number
  onsite: number
}

export type TopRoles = {
    role: string
    count: number
}

export type MarketOverview = {
  totalJobs: number
  averageSalary: number | null
  remoteDistribution: RemoteDistribution
  topRoles: TopRoles[]
}

export type GetMarketOverviewParams = {
  countryCode?: string
  role?: string
}