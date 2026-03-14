import { ArrowDownSLine } from "@/shared/ui/Icons"
import { useCountries } from "../hooks"

type Props = {
    countryCode?: string
    role: string
    onCountryChange: (value?: string) => void
    onRoleChange: (value: string) => void
}

function formatLastIngested(isoDate: string | null): string | null {
    if (!isoDate) return null
    const diffMs = Date.now() - new Date(isoDate).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours < 1) return "less than an hour ago"
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`
}

export function MarketFilters({ countryCode, role, onCountryChange, onRoleChange }: Props) {
    const { data, isLoading } = useCountries()

    const selectedCountry = data?.find((c) => c.code === countryCode)

    const freshnessDate = selectedCountry
        ? selectedCountry.lastIngestedAt
        : (data
              ?.map((c) => c.lastIngestedAt)
              .filter((d): d is string => d !== null)
              .sort()
              .at(-1) ?? null)

    const freshness = formatLastIngested(freshnessDate)

    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex flex-col gap-1">
                <div className="relative">
                    <select
                        id="countryCode"
                        value={countryCode ?? ""}
                        onChange={(e) => onCountryChange(e.target.value || undefined)}
                        disabled={isLoading}
                        className="w-full border border-border text-sm text-foreground pl-3 pr-10 py-2 outline-none focus:border-foreground/40 disabled:text-muted-foreground transition-colors cursor-pointer appearance-none"
                    >
                        <option value="" className="bg-card">
                            All countries
                        </option>
                        {data?.map((country) => (
                            <option key={country.id} value={country.code} className="bg-card">
                                {country.name}
                            </option>
                        ))}
                    </select>
                    <ArrowDownSLine
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        width={16}
                        height={16}
                    />
                </div>
                {freshness && (
                    <p className="text-xs text-muted-foreground capitalize mt-2">
                        data from {freshness}
                    </p>
                )}
            </div>

            <input
                id="role"
                type="text"
                value={role}
                placeholder="Filter by role..."
                onChange={(e) => onRoleChange(e.target.value)}
                className="sm:w-80 border border-border text-sm text-foreground px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground transition-colors"
            />
        </div>
    )
}
