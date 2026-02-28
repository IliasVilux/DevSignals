import { useMarketOverview } from "../hooks"

export function MarketOverviewPage() {
    const { data, isLoading, error, isError } = useMarketOverview({})

    return(
        <div>
            <h1>Market Overview</h1>
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