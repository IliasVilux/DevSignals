import { apiFetch } from "./client"
import type { GetMarketOverviewParams, MarketOverview, Country, Skill } from "./types"

export function getMarketOverview(params: GetMarketOverviewParams = {}): Promise<MarketOverview> {
    const queryParams = new URLSearchParams()

    if (params.countryCode) {
        queryParams.append("countryCode", params.countryCode)
    }

    if (params.role) {
        queryParams.append("role", params.role)
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""

    return apiFetch<MarketOverview>(`/api/market/overview${query}`)
}

export function getCountries(): Promise<Country[]> {
    return apiFetch<Country[]>("/api/countries")
}

export function getSkills(): Promise<Skill[]> {
    return apiFetch<Skill[]>("/api/skills")
}

export function getUserSkills(): Promise<{ skillIds: string[] }> {
    return apiFetch<{ skillIds: string[] }>("/api/profile/skills")
}

export function updateUserSkills(skillIds: string[]): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/api/profile/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillIds }),
    })
}
