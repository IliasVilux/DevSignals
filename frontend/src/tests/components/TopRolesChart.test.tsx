import { TopRolesChart } from "@/features/market/components"
import { render, screen } from "@testing-library/react"

vi.mock("recharts", async () => {
    const actual = await vi.importActual<typeof import("recharts")>("recharts")
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        BarChart: ({
            data,
        }: {
            data: { role: string; count: number; avgSalary?: number | null }[]
        }) => (
            <div data-testid="bar-chart">
                {data.map((entry) => (
                    <div key={entry.role} data-testid="bar-entry">
                        <span>{entry.role}</span>
                        <span>{entry.count}</span>
                    </div>
                ))}
            </div>
        ),
        Bar: () => null,
        XAxis: () => null,
        YAxis: () => null,
    }
})

const defaultData = [
    { role: "Software Engineer", count: 30, avgSalary: 65000 },
    { role: "Data Scientist", count: 25, avgSalary: 72000 },
    { role: "Product Manager", count: 10, avgSalary: null },
]

describe("TopRolesChart", () => {
    it("renders an entry for each role", () => {
        render(<TopRolesChart data={defaultData} />)

        expect(screen.getAllByTestId("bar-entry")).toHaveLength(3)
    })

    it("renders role names and counts", () => {
        render(<TopRolesChart data={defaultData} />)

        expect(screen.getAllByText("Software Engineer").length).toBeGreaterThan(0)
        expect(screen.getAllByText("30").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Data Scientist").length).toBeGreaterThan(0)
        expect(screen.getAllByText("25").length).toBeGreaterThan(0)
    })

    it("renders empty chart without crashing when data is empty", () => {
        render(<TopRolesChart data={[]} />)

        expect(screen.queryAllByTestId("bar-entry")).toHaveLength(0)
    })
})
