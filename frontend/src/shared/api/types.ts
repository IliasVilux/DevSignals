export type RemoteDistribution = {
    remote: number
    hybrid: number
    onsite: number
}

export type TopRoles = {
    role: string
    count: number
}

export type SkillCategory = "LANGUAGE" | "FRAMEWORK" | "DATABASE" | "DEVOPS" | "CLOUD" | "OTHER"

export type TopSkill = {
    name: string
    category: SkillCategory
    count: number
}

export type MarketOverview = {
    totalJobs: number
    averageSalary: number | null
    remoteDistribution: RemoteDistribution
    topRoles: TopRoles[]
    topSkills: TopSkill[]
}

export type GetMarketOverviewParams = {
    countryCode?: string
    role?: string
}

export type Country = {
    id: string
    code: string
    name: string
}
