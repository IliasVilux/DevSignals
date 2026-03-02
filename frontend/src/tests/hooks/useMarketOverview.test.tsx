import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMarketOverview } from "../../features/market/hooks";
import { renderHook, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe("useMarketOverview", () => {
    it("should return loading state initially", () => {
        const { result } = renderHook(() => useMarketOverview({}), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();
    });

    it("should return market data when API responds successfully", async () => {
        const { result } = renderHook(() => useMarketOverview({}), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual({
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
    });

    it("should return error state when API fails", async () => {
        server.use(
            http.get("*/api/market/overview", () => HttpResponse.error())
        );

        const { result } = renderHook(() => useMarketOverview({}), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.data).toBeUndefined();
    });

    it("should refetch when filters change", async () => {
        server.use(
            http.get("*/api/market/overview", ({ request }) => {
                const url = new URL(request.url);
                const countryCode = url.searchParams.get("countryCode");

                if (countryCode === "GB") {
                    return HttpResponse.json({
                        totalJobs: 100,
                        averageSalary: 60000,
                        remoteDistribution: { remote: 40, hybrid: 35, onsite: 25 },
                        topRoles: [{ role: "Software Engineer", count: 30 }],
                    });
                }

                if (countryCode === "ES") {
                    return HttpResponse.json({
                        totalJobs: 50,
                        averageSalary: 35000,
                        remoteDistribution: { remote: 20, hybrid: 30, onsite: 50 },
                        topRoles: [{ role: "Frontend Developer", count: 15 }],
                    });
                }
            })
        );

        const { result, rerender } = renderHook(
            ({ countryCode, role }) => useMarketOverview({ countryCode, role }),
            {
                initialProps: { countryCode: "GB", role: "" },
                wrapper: createWrapper(),
            }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.totalJobs).toBe(100);

        rerender({ countryCode: "ES", role: "" });

        await waitFor(() => expect(result.current.data?.totalJobs).toBe(50));
        expect(result.current.data?.averageSalary).toBe(35000);
    });
});