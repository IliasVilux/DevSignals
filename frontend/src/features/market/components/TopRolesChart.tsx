import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts"
import type { TopRoles } from "../../../shared/api/types"

type Props = {
    data: TopRoles[]
}

export function TopRolesChart({ data }: Props) {
    return (
        <ResponsiveContainer width="100%" height={data.length * 60}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 16, right: 48, bottom: 0, left: 0 }}
                barSize={25}
            >
                <XAxis type="number" hide />
                <YAxis
                    type="category"
                    dataKey="role"
                    tick={({ x, y, payload }) => (
                        <text
                            x={0}
                            y={y}
                            dy={3}
                            fill="oklch(0.705 0.015 286.067)"
                            fontSize={12}
                            textAnchor="start"
                        >
                            {payload.value.length > 30 ? `${payload.value.slice(0, 30)}…` : payload.value}
                        </text>
                    )}
                    axisLine={false}
                    tickLine={false}
                    width={215}
                />
                <Bar
                    dataKey="count"
                    fill="oklch(1 0 0 / 20%)"
                    radius={0}
                    label={{
                        position: "right",
                        fill: "oklch(0.985 0 0)",
                        fontSize: 12,
                    }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}