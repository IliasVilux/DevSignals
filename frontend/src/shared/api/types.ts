export type RemoteDistribution = {
    remote: number
    hybrid: number
    onsite: number
}

export type TopRoles = {
    role: string
    count: number
    avgSalary: number | null
}

export type SkillCategory = "LANGUAGE" | "FRAMEWORK" | "DATABASE" | "DEVOPS" | "CLOUD" | "OTHER"

export type TopSkill = {
    name: string
    category: SkillCategory
    count: number
}

export type SkillCategoryBreakdown = {
    category: SkillCategory
    count: number
    percentage: number
    skills: TopSkill[]
}

export type MarketOverview = {
    totalJobs: number
    averageSalary: number | null
    remoteDistribution: RemoteDistribution
    topRoles: TopRoles[]
    topSkills: TopSkill[]
    skillCategoryBreakdown: SkillCategoryBreakdown[]
}

export type GetMarketOverviewParams = {
    countryCode?: string
    role?: string
}

export type Country = {
    id: string
    code: string
    name: string
    lastIngestedAt: string | null
}
