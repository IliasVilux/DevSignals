import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type {
    SkillCategoryBreakdown as SkillCategoryBreakdownData,
    SkillCategory,
} from "@/shared/api/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip"

const CATEGORY_LABELS: Record<SkillCategory, string> = {
    LANGUAGE: "Languages",
    FRAMEWORK: "Frameworks",
    DATABASE: "Databases",
    DEVOPS: "DevOps",
    CLOUD: "Cloud",
    OTHER: "Other",
}

type Props = {
    breakdown: SkillCategoryBreakdownData
}

function MobileSkillCategoryBreakdown({ breakdown }: Props) {
    const maxCount = Math.max(...breakdown.skills.map((s) => s.count))

    return (
        <div className="space-y-4 pt-2">
            {breakdown.skills.map((skill) => (
                <div key={skill.name}>
                    <p
                        style={{
                            color: "oklch(0.985 0 0)",
                            fontSize: 13,
                            marginBottom: 4,
                        }}
                    >
                        {skill.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <div
                            style={{
                                height: 25,
                                width: `${(skill.count / maxCount) * 100}%`,
                                background: "var(--indigo-low)",
                            }}
                        />
                        <span style={{ color: "oklch(0.985 0 0)", fontSize: 13 }}>
                            {skill.count}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function SkillCategoryBreakdown({ breakdown }: Props) {
    return (
        <>
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between mb-6">
                <h1 className="text-2xl">{CATEGORY_LABELS[breakdown.category]}</h1>
                <span className="text-xs text-muted-foreground tracking-widest capitalize">
                    found in {breakdown.percentage}% of jobs · {breakdown.count} listings
                </span>
            </div>
            <div className="md:hidden">
                <MobileSkillCategoryBreakdown breakdown={breakdown} />
            </div>
            <div className="hidden md:block">
                <ResponsiveContainer width="100%" height={breakdown.skills.length * 60}>
                    <BarChart data={breakdown.skills} layout="vertical" barSize={25}>
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
