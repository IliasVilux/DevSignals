import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { MarketOverviewPage } from "@/features/market"
import { render, screen, waitFor } from "@testing-library/react"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"

vi.mock("recharts", async () => {
    const actual = await vi.importActual<typeof import("recharts")>("recharts")
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        BarChart: ({
            data,
        }: {
            data: { name?: string; role?: string; value?: number; count?: number }[]
        }) => (
            <div data-testid="bar-chart">
                {data.map((entry, i) => (
                    <div key={i} data-testid="bar-entry">
                        <span>{entry.name ?? entry.role}</span>
                        <span>{entry.value ?? entry.count}</span>
                    </div>
                ))}
            </div>
        ),
        Bar: () => null,
        XAxis: () => null,
        YAxis: () => null,
    }
})

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

describe("MarketOverviewPage", () => {
    describe("layout", () => {
        it("renders the header title", () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            expect(screen.getByText("DevSignals")).toBeInTheDocument()
            expect(screen.getByText(/tech job market/i)).toBeInTheDocument()
        })
    })

    describe("loading state", () => {
        it("shows loading skeleton while data is being fetched", () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            expect(screen.getByText(/fetching market data/i)).toBeInTheDocument()
        })
    })

    describe("empty state", () => {
        it("shows empty message when no jobs are found", async () => {
            server.use(
                http.get("*/api/market/overview", () =>
                    HttpResponse.json({
                        totalJobs: 0,
                        averageSalary: null,
                        remoteDistribution: { remote: 0, hybrid: 0, onsite: 0 },
                        topRoles: [],
                        topSkills: [],
                    })
                )
            )
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() => expect(screen.getByText(/no jobs found/i)).toBeInTheDocument())
            expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument()
        })
    })

    describe("error state", () => {
        it("shows error message when market overview API fails", async () => {
            server.use(http.get("*/api/market/overview", () => HttpResponse.error()))
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() => expect(screen.getByText(/failed to load market data/i)).toBeInTheDocument())
        })
    })

    describe("success state", () => {
        it("renders total jobs from API response", async () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() => expect(screen.getByText("100")).toBeInTheDocument())
        })

        it("renders formatted average salary", async () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() => expect(screen.getByText(/\$50[,.]?000/)).toBeInTheDocument())
        })

        it("renders remote distribution chart", async () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() =>
                expect(screen.getByText(/remote distribution/i)).toBeInTheDocument()
            )
            expect(screen.getAllByText("Remote").length).toBeGreaterThan(0)
            expect(screen.getAllByText("Hybrid").length).toBeGreaterThan(0)
            expect(screen.getAllByText("Onsite").length).toBeGreaterThan(0)
        })

        it("renders top roles chart", async () => {
            render(<MarketOverviewPage />, { wrapper: createWrapper() })

            await waitFor(() =>
                expect(screen.getAllByText("Software Engineer").length).toBeGreaterThan(0)
            )
            expect(screen.getAllByText("Data Scientist").length).toBeGreaterThan(0)
            expect(screen.getAllByText("Product Manager").length).toBeGreaterThan(0)
        })
    })
})
