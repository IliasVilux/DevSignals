import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import userEvent from "@testing-library/user-event"
import { MarketFilters } from "@/features/market/components"
import { render, screen, waitFor } from "@testing-library/react"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"
import { useState } from "react"

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

const defaultProps = {
    countryCode: undefined,
    role: "",
    onCountryChange: vi.fn(),
    onRoleChange: vi.fn(),
}

// Helper: render MarketFilters and wait for countries to load
const renderAndWait = async (props = defaultProps) => {
    render(<MarketFilters {...props} />, { wrapper: createWrapper() })
    await waitFor(() => expect(screen.queryByRole("option", { name: "Spain" })).toBeInTheDocument())
}

describe("MerketFilters", () => {
    describe("country select", () => {
        it("renders in disabled state while countries are loading", () => {
            render(<MarketFilters {...defaultProps} />, { wrapper: createWrapper() })

            expect(screen.getByRole("combobox")).toBeDisabled()
        })

        it("renders 'All countries' option and country list after load", async () => {
            await renderAndWait()
            const select = screen.getByRole("combobox")

            expect(select).toBeEnabled()
            expect(screen.getByRole("option", { name: "All countries" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "Spain" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "France" })).toBeInTheDocument()
            expect(screen.getByRole("option", { name: "United Kingdom" })).toBeInTheDocument()
        })

        it("calls onCountryChange with country code when a country is selected", async () => {
            const user = userEvent.setup()
            const onCountryChange = vi.fn()
            await renderAndWait({ ...defaultProps, onCountryChange })
            await user.selectOptions(screen.getByRole("combobox"), "ES")

            expect(onCountryChange).toHaveBeenCalledOnce()
            expect(onCountryChange).toHaveBeenCalledWith("ES")
        })

        it("calls onCountryChange with undefined when 'All countries' is selected", async () => {
            const user = userEvent.setup()
            const onCountryChange = vi.fn()
            await renderAndWait({ ...defaultProps, onCountryChange })
            await user.selectOptions(screen.getByRole("combobox"), "")

            expect(onCountryChange).toHaveBeenCalledWith(undefined)
        })

        it("renders select as disabled when API fails", async () => {
            server.use(http.get("*/api/countries", () => HttpResponse.error()))
            render(<MarketFilters {...defaultProps} />, { wrapper: createWrapper() })

            await waitFor(() => expect(screen.getByRole("combobox")).toBeDisabled())
        })
    })

    describe("role input", () => {
        it("renders with empty value and correct placeholder", () => {
            render(<MarketFilters {...defaultProps} />, { wrapper: createWrapper() })
            const input = screen.getByPlaceholderText("Filter by role...")

            expect(input).toBeInTheDocument()
            expect(input).toHaveValue("")
        })

        it("calls onRoleChange with typed value", async () => {
            const user = userEvent.setup()
            const onRoleChange = vi.fn()
            function Wrapper() {
                const [role, setRole] = useState("")
                return (
                    <MarketFilters
                        {...defaultProps}
                        role={role}
                        onRoleChange={(value) => {
                            setRole(value)
                            onRoleChange(value)
                        }}
                    />
                )
            }
            render(<Wrapper />, { wrapper: createWrapper() })
            await user.type(screen.getByPlaceholderText("Filter by role..."), "eng")

            expect(onRoleChange).toHaveBeenLastCalledWith("eng")
        })

        it("reflects role value passed via props", () => {
            render(<MarketFilters {...defaultProps} role="backend" />, { wrapper: createWrapper() })

            expect(screen.getByPlaceholderText("Filter by role...")).toHaveValue("backend")
        })
    })
})
