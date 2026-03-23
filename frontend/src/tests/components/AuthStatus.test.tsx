import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "../../features/auth"
import { AuthStatus } from "../../features/auth/components/AuthStatus"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    )
}

describe("AuthStatus", () => {
    describe("unauthenticated state", () => {
        it("shows sign in label", async () => {
            render(<AuthStatus />, { wrapper: createWrapper() })
            await waitFor(() => expect(screen.getByText(/sign in/i)).toBeInTheDocument())
        })

        it("shows Google and GitHub sign-in links", async () => {
            render(<AuthStatus />, { wrapper: createWrapper() })
            await waitFor(() => {
                const links = screen.getAllByRole("link")
                expect(links).toHaveLength(2)
            })
        })
    })

    describe("authenticated state", () => {
        const mockUser = {
            sub: "github:456",
            provider: "github",
            email: "ilias@example.com",
            name: "Ilias Dev",
            picture: null,
        }

        beforeEach(() => {
            server.use(http.get("*/auth/me", () => HttpResponse.json(mockUser)))
        })

        it("shows the user name", async () => {
            render(<AuthStatus />, { wrapper: createWrapper() })
            await waitFor(() => expect(screen.getByText("Ilias Dev")).toBeInTheDocument())
        })

        it("shows sign out button", async () => {
            render(<AuthStatus />, { wrapper: createWrapper() })
            await waitFor(() =>
                expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
            )
        })

        it("calls logout endpoint and clears auth on sign out", async () => {
            let logoutCalled = false
            server.use(
                http.post("*/auth/logout", () => {
                    logoutCalled = true
                    return HttpResponse.json({})
                })
            )

            render(<AuthStatus />, { wrapper: createWrapper() })
            await waitFor(() =>
                expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
            )

            await userEvent.click(screen.getByRole("button", { name: /sign out/i }))
            expect(logoutCalled).toBe(true)
        })
    })
})
