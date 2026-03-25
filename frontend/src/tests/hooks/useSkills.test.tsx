import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { useSkills } from "@/features/profile/hooks/useSkills"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe("useSkills", () => {
    it("should return loading state initially", () => {
        const { result } = renderHook(() => useSkills(), {
            wrapper: createWrapper(),
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it("should return skills when API responds successfully", async () => {
        const { result } = renderHook(() => useSkills(), {
            wrapper: createWrapper(),
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual([
            { id: "skill-1", name: "TypeScript", category: "LANGUAGE" },
            { id: "skill-2", name: "React", category: "FRAMEWORK" },
            { id: "skill-3", name: "PostgreSQL", category: "DATABASE" },
        ])
    })

    it("should return error state when API fails", async () => {
        server.use(http.get("*/api/skills", () => HttpResponse.error()))

        const { result } = renderHook(() => useSkills(), {
            wrapper: createWrapper(),
        })
        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.data).toBeUndefined()
    })
})
