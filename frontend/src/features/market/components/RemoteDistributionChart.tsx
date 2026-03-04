import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts"
import type { RemoteDistribution } from "@/shared/api/types"

type Props = RemoteDistribution

const data = (remote: number, hybrid: number, onsite: number) => [
    { name: "Remote", value: remote, fill: "oklch(1 0 0 / 90%)" },
    { name: "Hybrid", value: hybrid, fill: "oklch(1 0 0 / 50%)" },
    { name: "Onsite", value: onsite, fill: "oklch(1 0 0 / 20%)" },
]

export function RemoteDistributionChart({ hybrid, remote, onsite }: Props) {
    return (
        <ResponsiveContainer width="100%" height={3 * 60}>
            <BarChart
                data={data(remote, hybrid, onsite)}
                layout="vertical"
                margin={{ top: 16, right: 48, bottom: 0, left: 0 }}
                barSize={25}
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "oklch(0.705 0.015 286.067)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                />
                <Bar
                    dataKey="value"
                    radius={0}
                    label={{
                        position: "right",
                        formatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
                        fill: "oklch(0.985 0 0)",
                        fontSize: 12,
                    }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}