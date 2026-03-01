import { apiFetch } from "./client"
import type { GetMarketOverviewParams, MarketOverview, Country } from "./types"

export function getMarketOverview(params: GetMarketOverviewParams = {}): Promise<MarketOverview> {
    const queryParams = new URLSearchParams()

    if (params.countryCode) {
        queryParams.append('countryCode', params.countryCode)
    }

    if (params.role) {
        queryParams.append('role', params.role)
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ''

    return apiFetch<MarketOverview>(`/api/market/overview${query}`)
}

export function getCountries(): Promise<Country[]> {
    return apiFetch<Country[]>('/api/countries')
}