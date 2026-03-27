import { apiFetch } from "./client"
import type { GetMarketOverviewParams, MarketOverview, Country, Skill, UserSkill } from "./types"

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

export function getUserSkills(): Promise<{ skills: UserSkill[] }> {
    return apiFetch<{ skills: UserSkill[] }>("/api/profile/skills")
}

export function updateUserSkills(skills: UserSkill[]): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/api/profile/skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
    })
}
