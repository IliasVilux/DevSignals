import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { RemoteDistribution } from "@/shared/api/types"

type Props = RemoteDistribution

const chartData = (remote: number, hybrid: number, onsite: number) => [
    { name: "Remote", value: remote, fill: "var(--indigo-high)" },
    { name: "Hybrid", value: hybrid, fill: "var(--indigo-muted)" },
    { name: "Onsite", value: onsite, fill: "var(--indigo-subtle)" },
]

function MobileRemoteDistributionChart({ remote, hybrid, onsite }: Props) {
    const items = chartData(remote, hybrid, onsite)
    const maxValue = Math.max(remote, hybrid, onsite)

    return (
        <div className="space-y-5 pt-2">
            {items.map((item) => (
                <div key={item.name}>
                    <p
                        style={{
                            color: "oklch(0.985 0 0)",
                            fontSize: 13,
                            marginBottom: 4,
                        }}
                    >
                        {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <div
                            style={{
                                height: 25,
                                width: `${(item.value / maxValue) * 100}%`,
                                background: item.fill,
                            }}
                        />
                        <span style={{ color: "oklch(0.985 0 0)", fontSize: 13 }}>
                            {item.value.toFixed(0)}%
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function RemoteDistributionChart({ hybrid, remote, onsite }: Props) {
    return (
        <>
            <div className="md:hidden">
                <MobileRemoteDistributionChart remote={remote} hybrid={hybrid} onsite={onsite} />
            </div>
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={3 * 60}>
                    <BarChart
                        data={chartData(remote, hybrid, onsite)}
                        layout="vertical"
                        barSize={25}
                    >
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
            </div>
        </>
    )
}
