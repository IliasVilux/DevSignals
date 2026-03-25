import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { useUserSkills } from "@/features/profile/hooks/useUserSkills"
import { AuthProvider } from "@/features/auth"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

const mockUser = {
    sub: "cuid_abc123",
    provider: "google",
    email: "test@example.com",
    name: "Test User",
    picture: null,
}

const createWrapper = (authenticated = false) => {
    if (authenticated) {
        server.use(http.get("*/auth/me", () => HttpResponse.json(mockUser)))
    }

    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    )
}

describe("useUserSkills", () => {
    it("should not fetch when unauthenticated", async () => {
        const { result } = renderHook(() => useUserSkills(), {
            wrapper: createWrapper(false),
        })

        await waitFor(() => expect(result.current.fetchStatus).toBe("idle"))
        expect(result.current.data).toBeUndefined()
    })

    it("should fetch skills when authenticated", async () => {
        server.use(
            http.get("*/api/profile/skills", () =>
                HttpResponse.json({ skillIds: ["skill-1", "skill-2"] })
            )
        )

        const { result } = renderHook(() => useUserSkills(), {
            wrapper: createWrapper(true),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ skillIds: ["skill-1", "skill-2"] })
    })

    it("should return empty skillIds when user has no skills", async () => {
        const { result } = renderHook(() => useUserSkills(), {
            wrapper: createWrapper(true),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toEqual({ skillIds: [] })
    })
})
