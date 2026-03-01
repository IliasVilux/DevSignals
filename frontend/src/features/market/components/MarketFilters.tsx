import { useCountries } from "../hooks"

type Props = {
    countryCode?: string
    role: string
    onCountryChange: (value?: string) => void
    onRoleChange: (value: string) => void
}

export function MarketFilters({
    countryCode, role, onCountryChange, onRoleChange
}: Props) {
    const { data, isLoading } = useCountries()

    return (
        <div>
            <label htmlFor="countryCode">Country:</label>
            <select
                id="countryCode"
                value={countryCode}
                onChange={(e) => onCountryChange(e.target.value || undefined)}
                disabled={isLoading}
            >
                <option value="">All</option>
                {data?.map((country) => (
                    <option key={country.id} value={country.code}>{country.name}</option>
                ))}
            </select>

            <label htmlFor="role">Role:</label>
            <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
            />
        </div>
    )
}