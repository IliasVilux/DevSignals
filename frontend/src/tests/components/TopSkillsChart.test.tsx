import { TopSkillsChart } from "@/features/market/components"
import { render, screen } from "@testing-library/react"

vi.mock("recharts", async () => {
    const actual = await vi.importActual<typeof import("recharts")>("recharts")
    return {
        ...actual,
        ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        BarChart: ({ data }: { data: { name: string; count: number }[] }) => (
            <div data-testid="bar-chart">
                {data.map((entry) => (
                    <div key={entry.name} data-testid="bar-entry">
                        <span>{entry.name}</span>
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
    { name: "TypeScript", category: "LANGUAGE" as const, count: 10 },
    { name: "React", category: "FRAMEWORK" as const, count: 7 },
    { name: "PostgreSQL", category: "DATABASE" as const, count: 4 },
]

describe("TopSkillsChart", () => {
    it("renders an entry for each skill", () => {
        render(<TopSkillsChart data={defaultData} />)

        expect(screen.getAllByTestId("bar-entry")).toHaveLength(3)
    })

    it("renders skill names and counts", () => {
        render(<TopSkillsChart data={defaultData} />)

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.getByText("10")).toBeInTheDocument()
        expect(screen.getByText("React")).toBeInTheDocument()
        expect(screen.getByText("7")).toBeInTheDocument()
    })

    it("renders empty chart without crashing when data is empty", () => {
        render(<TopSkillsChart data={[]} />)

        expect(screen.queryAllByTestId("bar-entry")).toHaveLength(0)
    })
})
