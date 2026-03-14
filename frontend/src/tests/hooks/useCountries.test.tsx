import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useCountries } from "@/features/market/hooks"
import { renderHook, waitFor } from "@testing-library/react"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries for testing
            },
        },
    })

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe("useCountries", () => {
    it("should return loading state initially", () => {
        const { result } = renderHook(() => useCountries(), {
            wrapper: createWrapper(),
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it("should return countries when API responds successfully", async () => {
        const { result } = renderHook(() => useCountries(), {
            wrapper: createWrapper(),
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual([
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
    })

    it("should return error state when API fails", async () => {
        server.use(http.get("*/api/countries", () => HttpResponse.error()))

        const { result } = renderHook(() => useCountries(), {
            wrapper: createWrapper(),
        })
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.data).toBeUndefined()
    })
})
