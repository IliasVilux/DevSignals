import { useState } from "react"
import { useMarketOverview } from "../hooks"
import { MarketFilters, RemoteDistributionChart, TopRolesChart } from "../components"
import { useDebounce } from "@/shared/hooks"

export function MarketOverviewPage() {
    const [countryCode, setCountryCode] = useState<string | undefined>(undefined)
    const [role, setRole] = useState<string>("")
    const debouncedRole = useDebounce(role, 500)

    const { data, isLoading, error, isError } = useMarketOverview({
        countryCode,
        role: debouncedRole || undefined,
    })

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b border-border px-6 py-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
                        Tech Job Market
                    </p>
                    <h1 className="font-display font-bold text-3xl">DevSignals</h1>
                </div>
            </header>

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
                    <p className="text-xs text-muted-foreground tracking-widest uppercase animate-pulse px-6 md:px-0 py-8">
                        fetching market data...
                    </p>
                )}
                {isError && (
                    <p className="text-xs text-destructive tracking-widest uppercase px-6 md:px-0 py-8">
                        error: {error.message}
                    </p>
                )}
                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-3 md:border-x md:border-b border-border">
                        {/* Stats column */}
                        <div className="flex flex-col divide-y divide-border border-b md:border-r md:h-full">
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

                        {/* Remote distribution */}
                        <div className="col-span-1 md:col-span-2 px-8 py-6 border-b border-border">
                            <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                remote distribution
                            </p>
                            <RemoteDistributionChart {...data.remoteDistribution} />
                        </div>

                        {/* Top roles */}
                        <div className="col-span-1 md:col-span-3 px-8 py-6">
                            <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                top roles
                            </p>
                            <TopRolesChart data={data.topRoles} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
