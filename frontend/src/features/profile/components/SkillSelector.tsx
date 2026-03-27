import { useState } from "react"
import type { Skill } from "@/shared/api/types"
import { useUpdateUserSkills } from "../hooks"
import { useScrambleText } from "../hooks/useScrambleText"

type Props = {
    skills: Skill[]
    userSkills?: string[]
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

export function SkillSelector({ skills, userSkills }: Props) {
    const byCategory = groupByCategory(skills)
    const [selectedIds, setSelectedIds] = useState<string[]>(userSkills || [])
    const { mutate } = useUpdateUserSkills()

    const [actionType, setActionType] = useState<"add" | "remove">("add")
    const { displayText, phase, trigger } = useScrambleText()

    function toggle(id: string) {
        const skill = skills.find((s) => s.id === id)
        const isAdding = !selectedIds.includes(id)
        const newIds = isAdding ? [...selectedIds, id] : selectedIds.filter((s) => s !== id)

        const previousIds = selectedIds
        setSelectedIds(newIds)
        mutate(newIds, {
            onError: () => setSelectedIds(previousIds),
        })

        if (skill) {
            setActionType(isAdding ? "add" : "remove")
            trigger(isAdding ? `${skill.name} added` : `${skill.name} removed`)
        }
    }

    return (
        <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
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
            <div className="space-y-12">
                {Object.entries(byCategory).map(([category, categorySkills]) => (
                    <div key={category}>
                        <span className="text-sm tracking-widest uppercase text-muted-foreground">
                            {category}
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-2">
                            {categorySkills.map((skill) => {
                                const selected = selectedIds.includes(skill.id)
                                return (
                                    <button
                                        key={skill.id}
                                        onClick={() => toggle(skill.id)}
                                        aria-pressed={selected}
                                        className={`px-3 py-2 text-xs tracking-wide text-center transition-colors cursor-pointer ${
                                            selected
                                                ? "border border-(--indigo) text-(--indigo) bg-(--indigo)/10 hover:bg-(--indigo)/20"
                                                : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                    >
                                        {skill.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
