import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { TopRoles } from "@/shared/api/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

type Props = {
    data: TopRoles[]
}

function formatSalary(value: number): string {
    return `${Math.round(value / 1000)}k`
}

function MobileTopRolesChart({ data }: Props) {
    const maxCount = Math.max(...data.map((d) => d.count))
    const maxSalary = Math.max(...data.map((d) => d.avgSalary ?? 0))

    return (
        <div className="space-y-5 pt-2">
            {data.map((item) => (
                <div key={item.role}>
                    <p
                        style={{
                            color: "oklch(0.705 0.015 286.067)",
                            fontSize: 12,
                            marginBottom: 4,
                        }}
                    >
                        {item.role}
                    </p>
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <div
                                style={{
                                    height: 18,
                                    width: `${(item.count / maxCount) * 100}%`,
                                    background: "oklch(1 0 0 / 20%)",
                                }}
                            />
                            <span style={{ color: "oklch(0.985 0 0)", fontSize: 12 }}>
                                {item.count}
                            </span>
                        </div>
                        {item.avgSalary != null && (
                            <div className="flex items-center gap-2">
                                <div
                                    style={{
                                        height: 18,
                                        width: `${(item.avgSalary / maxSalary) * 100}%`,
                                        background: "oklch(1 0 0 / 50%)",
                                    }}
                                />
                                <span style={{ color: "oklch(0.985 0 0)", fontSize: 12 }}>
                                    {formatSalary(item.avgSalary)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TopRolesChart({ data }: Props) {
    return (
        <>
            <div className="md:hidden">
                <MobileTopRolesChart data={data} />
            </div>
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={data.length * 90}>
                    <BarChart
                        data={data.map((d) => ({ ...d, avgSalary: d.avgSalary ?? undefined }))}
                        layout="vertical"
                        margin={{ top: 16, right: 32, bottom: 0, left: 0 }}
                        barSize={18}
                        barGap={2}
                    >
                        <XAxis xAxisId={0} type="number" hide />
                        <XAxis xAxisId={1} type="number" hide orientation="top" />
                        <YAxis
                            type="category"
                            dataKey="role"
                            tick={({ y, payload }) => {
                                const isTruncated = payload.value.length > 25
                                const displayText = isTruncated
                                    ? `${payload.value.slice(0, 25)}…`
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
                                    <foreignObject
                                        x={0}
                                        y={(y as number) - 10}
                                        width={200}
                                        height={20}
                                    >
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
                            width={200}
                        />
                        <Bar
                            xAxisId={0}
                            dataKey="count"
                            fill="oklch(1 0 0 / 20%)"
                            radius={0}
                            label={{
                                position: "right",
                                fill: "oklch(0.985 0 0)",
                                fontSize: 12,
                            }}
                        />
                        <Bar
                            xAxisId={1}
                            dataKey="avgSalary"
                            fill="oklch(1 0 0 / 50%)"
                            radius={0}
                            label={{
                                position: "right",
                                fill: "oklch(0.985 0 0)",
                                fontSize: 12,
                                formatter: (v: unknown) =>
                                    typeof v === "number" ? formatSalary(v) : "",
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}
