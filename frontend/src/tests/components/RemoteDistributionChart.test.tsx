import { RemoteDistributionChart } from "@/features/market/components"
import { render, screen } from "@testing-library/react"

vi.mock("recharts", async () => {
    const actual = await vi.importActual<typeof import("recharts")>("recharts")
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        BarChart: ({ data }: { data: { name: string; value: number }[] }) => (
            <div data-testid="bar-chart">
                {data.map((entry) => (
                    <div key={entry.name} data-testid="bar-entry">
                        <span>{entry.name}</span>
                        <span>{entry.value}%</span>
                    </div>
                ))}
            </div>
        ),
        Bar: () => null,
        XAxis: () => null,
        YAxis: () => null,
    }
})

const defaultProps = {
    remote: 40,
    hybrid: 35,
    onsite: 25,
}

describe("RemoteDistributionChart", () => {
    it("renders the three category labels", () => {
        render(<RemoteDistributionChart {...defaultProps} />)

        expect(screen.getByText("Remote")).toBeInTheDocument()
        expect(screen.getByText("Hybrid")).toBeInTheDocument()
        expect(screen.getByText("Onsite")).toBeInTheDocument()
    })

    it("renders formatted percentage labels for each value", () => {
        render(<RemoteDistributionChart {...defaultProps} />)

        expect(screen.getByText("40%")).toBeInTheDocument()
        expect(screen.getByText("35%")).toBeInTheDocument()
        expect(screen.getByText("25%")).toBeInTheDocument()
    })

    it("renders without crashing when all values are zero", () => {
        render(<RemoteDistributionChart remote={0} hybrid={0} onsite={0} />)

        expect(screen.getByText("Remote")).toBeInTheDocument()
        expect(screen.getAllByText("0%")).toHaveLength(3)
    })
})
