import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { TopSkill } from "@/shared/api/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

type Props = {
    data: TopSkill[]
}

function MobileTopSkillsChart({ data }: Props) {
    const maxCount = Math.max(...data.map((d) => d.count))

    return (
        <div className="space-y-4 pt-2">
            {data.map((item) => (
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
                                width: `${(item.count / maxCount) * 100}%`,
                                background: "var(--indigo-low)",
                            }}
                        />
                        <span style={{ color: "oklch(0.985 0 0)", fontSize: 13 }}>
                            {item.count}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function TopSkillsChart({ data }: Props) {
    return (
        <>
            <div className="md:hidden">
                <MobileTopSkillsChart data={data} />
            </div>
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={data.length * 60}>
                    <BarChart data={data} layout="vertical" barSize={25}>
                        <XAxis type="number" hide />
                        <YAxis
                            type="category"
                            dataKey="name"
                            tick={({ y, payload }) => {
                                const isTruncated = payload.value.length > 20
                                const displayText = isTruncated
                                    ? `${payload.value.slice(0, 20)}…`
                                    : payload.value

                                if (!isTruncated) {
                                    return (
                                        <text
                                            x={0}
                                            y={y}
                                            dy={3}
                                            fill="oklch(0.985 0 0)"
                                            fontSize={13}
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
                                        width={110}
                                        height={20}
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span
                                                    style={{
                                                        color: "oklch(0.985 0 0)",
                                                        fontSize: 13,
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
                            width={110}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--indigo-low)"
                            radius={0}
                            minPointSize={11}
                            label={{
                                position: "insideRight",
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
