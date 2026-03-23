import React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { useAuth } from "../../features/auth/hooks/useAuth"
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

describe("useAuth", () => {
    it("returns isLoading true initially", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
        expect(result.current.isLoading).toBe(true)
    })

    it("returns unauthenticated when /auth/me returns 401", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.isAuthenticated).toBe(false)
        expect(result.current.user).toBeNull()
    })

    it("returns authenticated user when /auth/me returns 200", async () => {
        const mockUser = {
            sub: "google:123",
            provider: "google",
            email: "test@example.com",
            name: "Test User",
            picture: "https://example.com/pic.jpg",
        }
        server.use(http.get("*/auth/me", () => HttpResponse.json(mockUser)))

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.user).toEqual(mockUser)
    })
})
