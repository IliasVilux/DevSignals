import { useState, useMemo } from "react"
import type { Skill, UserSkill, SkillLevel } from "@/shared/api/types"
import { useUpdateUserSkills } from "../hooks"
import { useScrambleText } from "../hooks/useScrambleText"

type Props = {
    skills: Skill[]
    userSkills?: UserSkill[]
}

function groupByCategory(skills: Skill[]) {
    return skills.reduce(
        (acc, skill) => {
            if (!acc[skill.category]) acc[skill.category] = []
            acc[skill.category].push(skill)
            return acc
        },
        {} as Record<string, Skill[]>
    )
}

const LEVELS: SkillLevel[] = ["BASIC", "INTERMEDIATE", "ADVANCED"]
const levelStyle: Record<SkillLevel, string> = {
    BASIC: "border border-(--indigo)/50 text-(--indigo)/70 bg-(--indigo)/5 hover:bg-(--indigo)/10",
    INTERMEDIATE:
        "border border-(--indigo) text-(--indigo) bg-(--indigo)/10 hover:bg-(--indigo)/20",
    ADVANCED:
        "border border-(--indigo) text-(--indigo) bg-(--indigo)/20 hover:bg-(--indigo)/30 font-medium",
}
const levelBarWidth: Record<SkillLevel, string> = {
    BASIC: "w-1/3",
    INTERMEDIATE: "w-2/3",
    ADVANCED: "w-full",
}

export function SkillSelector({ skills, userSkills }: Props) {
    const byCategory = useMemo(() => groupByCategory(skills), [skills])
    const skillsById = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills])
    const [selectedSkills, setSelectedSkills] = useState<Map<string, SkillLevel>>(
        () => new Map((userSkills || []).map((us) => [us.skillId, us.level]))
    )
    const { mutate } = useUpdateUserSkills()
    const [actionType, setActionType] = useState<"add" | "remove">("add")
    const { displayText, phase, trigger } = useScrambleText()

    function cycle(id: string) {
        const skill = skillsById.get(id)
        const current = selectedSkills.get(id)
        const currentIndex = current !== undefined ? LEVELS.indexOf(current) : -1
        const next = LEVELS[currentIndex + 1]

        const previousSkills = new Map(selectedSkills)
        const newSkills = new Map(selectedSkills)
        if (next !== undefined) {
            newSkills.set(id, next)
        } else {
            newSkills.delete(id)
        }

        setSelectedSkills(newSkills)

        const newSkillsArray: UserSkill[] = Array.from(newSkills.entries()).map(
            ([skillId, level]) => ({ skillId, level })
        )
        mutate(newSkillsArray, {
            onError: () => setSelectedSkills(previousSkills),
        })

        if (skill) {
            setActionType(next !== undefined ? "add" : "remove")
            trigger(
                next !== undefined
                    ? `${skill.name} — ${next.toLowerCase()}`
                    : `${skill.name} removed`
            )
        }
    }

    return (
        <section>
            {/* Header */}
            <div className="md:border-x border-b border-border px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 className="text-2xl">Select your skills</h1>
                <p
                    className={`font-mono text-xs tracking-wide transition-opacity duration-500 ${
                        actionType === "add" ? "text-emerald-500" : "text-muted-foreground"
                    } ${phase === "hidden" || phase === "fading" ? "opacity-0" : "opacity-100"}`}
                    aria-live="polite"
                >
                    {phase !== "hidden" ? displayText : "\u00A0"}
                </p>
            </div>

            {/* Category blocks */}
            {Object.entries(byCategory).map(([category, categorySkills]) => (
                <div key={category} className="md:border-x border-b border-border">
                    <p className="px-8 pt-5 pb-3 text-xs tracking-widest uppercase text-muted-foreground">
                        {category}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 px-8 pb-6">
                        {categorySkills.map((skill) => {
                            const level = selectedSkills.get(skill.id)
                            const isSelected = level !== undefined
                            return (
                                <button
                                    key={skill.id}
                                    onClick={() => cycle(skill.id)}
                                    aria-pressed={isSelected}
                                    data-level={level ?? undefined}
                                    className={`relative flex items-center justify-center h-10 px-3 text-xs tracking-wide text-center transition-colors cursor-pointer overflow-hidden ${
                                        isSelected && level
                                            ? levelStyle[level]
                                            : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                                    }`}
                                >
                                    <span>{skill.name}</span>
                                    <span
                                        aria-hidden="true"
                                        className={`absolute bottom-0 left-0 h-0.5 bg-(--indigo) transition-all duration-300 ${
                                            level ? levelBarWidth[level] : "w-0"
                                        }`}
                                    />
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </section>
    )
}
