import { useState } from "react"
import { useMarketOverview } from "../hooks"
import {
    MarketFilters,
    RemoteDistributionChart,
    TopRolesChart,
    TopSkillsChart,
    SkillCategoryBreakdown,
} from "../components"
import { useDebounce } from "@/shared/hooks"
import { Skeleton } from "@/shared/ui/skeleton"
import { AppHeader } from "@/shared/ui/AppHeader"

export function MarketOverviewPage() {
    const [countryCode, setCountryCode] = useState<string | undefined>(undefined)
    const [role, setRole] = useState<string>("")
    const debouncedRole = useDebounce(role, 500)

    const { data, isLoading, error, isError, refetch } = useMarketOverview({
        countryCode,
        role: debouncedRole || undefined,
    })

    return (
        <div className="min-h-screen">
            <AppHeader />

            {/* Filters */}
            <section className="border-b border-border px-6 py-3">
                <div className="max-w-6xl mx-auto">
                    <MarketFilters
                        countryCode={countryCode}
                        role={role}
                        onCountryChange={setCountryCode}
                        onRoleChange={setRole}
                    />
                </div>
            </section>

            {/* Main content */}
            <main className="max-w-6xl mx-auto">
                {isLoading && (
                    <div aria-live="polite">
                        <span className="sr-only">fetching market data</span>
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="flex flex-col divide-y divide-border border-x border-b md:border-r border-border">
                                <div className="px-8 py-6 space-y-3">
                                    <Skeleton className="h-2.5 w-16" />
                                    <Skeleton className="h-9 w-20" />
                                </div>
                                <div className="px-8 py-6 space-y-3">
                                    <Skeleton className="h-2.5 w-16" />
                                    <Skeleton className="h-9 w-24" />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 px-8 py-6 border-x md:border-l-0 border-b border-border space-y-3">
                                <Skeleton className="h-2.5 w-32" />
                                <Skeleton className="h-36" />
                            </div>
                        </div>
                        <div className="px-8 py-6 border-x border-b border-border space-y-3">
                            <Skeleton className="h-2.5 w-20" />
                            <Skeleton className="h-44" />
                        </div>
                        <div className="px-8 py-6 border-x border-b border-border space-y-3">
                            <Skeleton className="h-2.5 w-20" />
                            <Skeleton className="h-44" />
                        </div>
                        <div className="px-8 py-6 md:border-x border-t border-border mt-12">
                            <div className="space-y-3 mb-8">
                                <Skeleton className="h-2.5 w-20" />
                                <Skeleton className="h-44" />
                            </div>
                            <div className="space-y-3 mb-8">
                                <Skeleton className="h-2.5 w-24" />
                                <Skeleton className="h-36" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-2.5 w-16" />
                                <Skeleton className="h-28" />
                            </div>
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="px-6 md:px-0 py-16 flex flex-col items-center gap-4 text-center">
                        <p className="text-xs text-destructive tracking-widest uppercase">
                            failed to load market data
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {error?.message ?? "Something went wrong. Please try again."}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="text-xs tracking-widest uppercase border border-border px-5 py-2 hover:bg-accent transition-colors cursor-pointer"
                        >
                            retry
                        </button>
                    </div>
                )}

                {data && data.totalJobs === 0 && (
                    <div className="px-6 md:px-0 py-16 text-center">
                        <p className="text-xs text-muted-foreground tracking-widest uppercase">
                            no jobs found
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            try adjusting your filters
                        </p>
                    </div>
                )}
                {data && data.totalJobs > 0 && (
                    <div>
                        {/* Stats + Remote distribution */}
                        <div className="grid grid-cols-1 md:grid-cols-3">
                            <div className="flex flex-col divide-y divide-border md:border-x border-b border-border md:h-full">
                                <div className="flex-1 flex flex-col px-8 py-6">
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                        total jobs
                                    </p>
                                    <p className="text-4xl font-semibold tracking-tight">
                                        {data.totalJobs.toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex-1 flex flex-col px-8 py-6">
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                        avg. salary
                                    </p>
                                    <p className="text-4xl font-semibold tracking-tight">
                                        {data.averageSalary
                                            ? `$${Math.round(data.averageSalary).toLocaleString()}`
                                            : "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 px-8 py-6 md:border-r border-b border-border">
                                <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                    remote distribution
                                </p>
                                <RemoteDistributionChart {...data.remoteDistribution} />
                            </div>
                        </div>

                        {/* Top roles */}
                        <div className="px-8 py-6 md:border-x border-b border-border">
                            <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                top roles
                            </p>
                            <TopRolesChart data={data.topRoles} />
                        </div>

                        {/* Top skills */}
                        <div className="px-8 py-6 md:border-x border-b border-border">
                            <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                top skills
                            </p>
                            <TopSkillsChart data={data.topSkills} />
                        </div>

                        {/* Skill category breakdown */}
                        <div className="px-8 py-6 md:border-x border-t border-border mt-12">
                            {data.skillCategoryBreakdown.map((breakdown) => (
                                <div key={breakdown.category} className="mt-12 first:mt-6">
                                    <SkillCategoryBreakdown breakdown={breakdown} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
