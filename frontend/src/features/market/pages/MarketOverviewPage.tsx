import { useState } from "react"
import { useMarketOverview } from "../hooks"
import { MarketFilters } from "../components"
import { useDebounce } from "../../../shared/hooks"

export function MarketOverviewPage() {
    const [countryCode, setCountryCode] = useState<string | undefined>(undefined)
    const [role, setRole] = useState<string>("")
    const debouncedRole = useDebounce(role, 500)

    const { data, isLoading, error, isError } = useMarketOverview({
        countryCode,
        role: debouncedRole || undefined
    })

    return(
        <div>
            <h1>Market Overview</h1>
            <MarketFilters countryCode={countryCode} role={role} onCountryChange={setCountryCode} onRoleChange={setRole} />
            {isLoading && <p>Loading...</p>}
            {isError && <p>Error: {error.message}</p>}
            {data && (
                <div>
                    <p>Total Jobs: {data.totalJobs}</p>
                    <p>Average Salary: {data.averageSalary}</p>
                    <p>Hybrid Distribution: {data.remoteDistribution.hybrid}</p>
                    <p>Onsite Distribution: {data.remoteDistribution.onsite}</p>
                    <p>Remote Distribution: {data.remoteDistribution.remote}</p>
                    <h2>Top Roles</h2>
                    <ul>
                        {data.topRoles.map((role) => (
                            <li key={role.role}>{role.role}: {role.count} jobs</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}