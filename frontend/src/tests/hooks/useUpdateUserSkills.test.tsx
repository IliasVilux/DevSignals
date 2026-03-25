import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useUpdateUserSkills } from "@/features/profile/hooks/useUpdateUserSkills"
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

describe("useUpdateUserSkills", () => {
    it("should call PUT /api/profile/skills with skillIds", async () => {
        let receivedBody: unknown = null
        server.use(
            http.put("*/api/profile/skills", async ({ request }) => {
                receivedBody = await request.json()
                return HttpResponse.json({ message: "Skills updated" })
            })
        )

        const { result } = renderHook(() => useUpdateUserSkills(), {
            wrapper: createWrapper(),
        })

        await act(() => result.current.mutateAsync(["skill-1", "skill-3"]))
        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(receivedBody).toEqual({ skillIds: ["skill-1", "skill-3"] })
    })

    it("should return error state when API fails", async () => {
        server.use(http.put("*/api/profile/skills", () => HttpResponse.error()))

        const { result } = renderHook(() => useUpdateUserSkills(), {
            wrapper: createWrapper(),
        })

        await act(async () => {
            try {
                await result.current.mutateAsync(["skill-1"])
            } catch {
                // expected
            }
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})
