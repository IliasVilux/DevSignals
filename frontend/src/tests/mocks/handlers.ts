import { http, HttpResponse } from 'msw';

export const handlers = [
    http.get("*/api/countries", () => {
        return HttpResponse.json([
            {
                "id": "1",
                "name": "Spain",
                "code": "ES"
            },
            {
                "id": "2",
                "name": "France",
                "code": "FR"
            },
            {
                "id": "3",
                "name": "United Kingdom",
                "code": "GB"
            }
        ]);
    }),

    http.get("*/api/market/overview", () => {
        return HttpResponse.json({
            totalJobs: 100,
            averageSalary: 50000,
            remoteDistribution: { remote: 40, hybrid: 35, onsite: 25 },
            topRoles: [
                {
                    role: "Software Engineer",
                    count: 30
                },
                {
                    role: "Data Scientist",
                    count: 25
                },
                {
                    role: "Product Manager",
                    count: 10
                }
            ],
        });
    })
]