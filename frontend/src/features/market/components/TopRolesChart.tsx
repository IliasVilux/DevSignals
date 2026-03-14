import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { TopRoles } from "@/shared/api/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

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
                    tick={({ y, payload }) => {
                        const isTruncated = payload.value.length > 30
                        const displayText = isTruncated
                            ? `${payload.value.slice(0, 30)}…`
                            : payload.value

                        if (!isTruncated) {
                            return (
                                <text
                                    x={0}
                                    y={y}
                                    dy={3}
                                    fill="oklch(0.705 0.015 286.067)"
                                    fontSize={12}
                                    textAnchor="start"
                                >
                                    {displayText}
                                </text>
                            )
                        }

                        return (
                            <foreignObject x={0} y={(y as number) - 10} width={250} height={20}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            style={{
                                                color: "oklch(0.705 0.015 286.067)",
                                                fontSize: 12,
                                                cursor: "default",
                                                display: "inline-block",
                                                lineHeight: "20px",
                                            }}
                                        >
                                            {displayText}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{payload.value}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </foreignObject>
                        )
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={250}
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
