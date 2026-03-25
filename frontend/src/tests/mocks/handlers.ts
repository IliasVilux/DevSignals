import { http, HttpResponse } from "msw"

export const handlers = [
    http.get("*/auth/me", () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 })
    }),

    http.get("*/api/countries", () => {
        return HttpResponse.json([
            {
                id: "1",
                name: "Spain",
                code: "ES",
                lastIngestedAt: "2026-03-14T10:00:00.000Z",
            },
            {
                id: "2",
                name: "France",
                code: "FR",
                lastIngestedAt: null,
            },
            {
                id: "3",
                name: "United Kingdom",
                code: "GB",
                lastIngestedAt: "2026-03-14T08:00:00.000Z",
            },
        ])
    }),

    http.get("*/api/skills", () => {
        return HttpResponse.json([
            { id: "skill-1", name: "TypeScript", category: "LANGUAGE" },
            { id: "skill-2", name: "React", category: "FRAMEWORK" },
            { id: "skill-3", name: "PostgreSQL", category: "DATABASE" },
        ])
    }),

    http.get("*/api/profile/skills", () => {
        return HttpResponse.json({ skillIds: [] })
    }),

    http.put("*/api/profile/skills", () => {
        return HttpResponse.json({ message: "Skills updated" })
    }),

    http.get("*/api/market/overview", () => {
        return HttpResponse.json({
            totalJobs: 100,
            averageSalary: 50000,
            remoteDistribution: { remote: 40, hybrid: 35, onsite: 25 },
            topRoles: [
                { role: "Software Engineer", count: 30, avgSalary: 65000 },
                { role: "Data Scientist", count: 25, avgSalary: 72000 },
                { role: "Product Manager", count: 10, avgSalary: null },
            ],
            topSkills: [
                { name: "TypeScript", category: "LANGUAGE", count: 20 },
                { name: "React", category: "FRAMEWORK", count: 15 },
                { name: "PostgreSQL", category: "DATABASE", count: 8 },
            ],
            skillCategoryBreakdown: [
                {
                    category: "LANGUAGE",
                    count: 20,
                    percentage: 49,
                    skills: [{ name: "TypeScript", category: "LANGUAGE", count: 20 }],
                },
                {
                    category: "FRAMEWORK",
                    count: 15,
                    percentage: 37,
                    skills: [{ name: "React", category: "FRAMEWORK", count: 15 }],
                },
                {
                    category: "DATABASE",
                    count: 8,
                    percentage: 20,
                    skills: [{ name: "PostgreSQL", category: "DATABASE", count: 8 }],
                },
            ],
        })
    }),
]
