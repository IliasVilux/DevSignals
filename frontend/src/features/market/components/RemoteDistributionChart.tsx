import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { RemoteDistribution } from "@/shared/api/types"

type Props = RemoteDistribution

const data = (remote: number, hybrid: number, onsite: number) => [
    { name: "Remote", value: remote, fill: "var(--indigo-high)" },
    { name: "Hybrid", value: hybrid, fill: "var(--indigo-muted)" },
    { name: "Onsite", value: onsite, fill: "var(--indigo-subtle)" },
]

export function RemoteDistributionChart({ hybrid, remote, onsite }: Props) {
    return (
        <ResponsiveContainer width="100%" height={3 * 60}>
            <BarChart data={data(remote, hybrid, onsite)} layout="vertical" barSize={25}>
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "oklch(0.985 0 0)", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={16}
                    width={62}
                />
                <Bar
                    dataKey="value"
                    radius={0}
                    minPointSize={22}
                    label={{
                        position: "insideRight",
                        formatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
                        fill: "oklch(0.985 0 0)",
                        fontSize: 13,
                    }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
