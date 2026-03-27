import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SkillSelector } from "../../features/profile/components/SkillSelector"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"
import type { Skill, UserSkill } from "@/shared/api/types"

const mockSkills: Skill[] = [
    { id: "skill-1", name: "TypeScript", category: "LANGUAGE" },
    { id: "skill-2", name: "Python", category: "LANGUAGE" },
    { id: "skill-3", name: "React", category: "FRAMEWORK" },
    { id: "skill-4", name: "PostgreSQL", category: "DATABASE" },
]

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe("SkillSelector", () => {
    describe("rendering", () => {
        it("renders skills grouped by category", () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            expect(screen.getByText("LANGUAGE")).toBeInTheDocument()
            expect(screen.getByText("FRAMEWORK")).toBeInTheDocument()
            expect(screen.getByText("DATABASE")).toBeInTheDocument()
            expect(screen.getByText("TypeScript")).toBeInTheDocument()
            expect(screen.getByText("React")).toBeInTheDocument()
            expect(screen.getByText("PostgreSQL")).toBeInTheDocument()
        })

        it("renders all skills as unselected by default", () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const buttons = screen.getAllByRole("button")
            buttons.forEach((btn) => {
                expect(btn).toHaveAttribute("aria-pressed", "false")
            })
        })

        it("pre-selects skills passed via userSkills prop", () => {
            const userSkills: UserSkill[] = [
                { skillId: "skill-1", level: "BASIC" },
                { skillId: "skill-3", level: "INTERMEDIATE" },
            ]
            render(<SkillSelector skills={mockSkills} userSkills={userSkills} />, {
                wrapper: createWrapper(),
            })

            expect(screen.getByRole("button", { name: "TypeScript" })).toHaveAttribute(
                "aria-pressed",
                "true"
            )
            expect(screen.getByRole("button", { name: "React" })).toHaveAttribute(
                "aria-pressed",
                "true"
            )
            expect(screen.getByRole("button", { name: "PostgreSQL" })).toHaveAttribute(
                "aria-pressed",
                "false"
            )
        })
    })

    describe("cycle interaction", () => {
        it("first click sets skill to BASIC (aria-pressed true)", async () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "false")

            await userEvent.click(typescript)

            expect(typescript).toHaveAttribute("aria-pressed", "true")
        })

        it("cycles through BASIC → INTERMEDIATE → ADVANCED → unselected", async () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const typescript = screen.getByRole("button", { name: "TypeScript" })

            await userEvent.click(typescript) // → BASIC
            expect(typescript).toHaveAttribute("aria-pressed", "true")
            expect(typescript).toHaveAttribute("data-level", "BASIC")

            await userEvent.click(typescript) // → INTERMEDIATE
            expect(typescript).toHaveAttribute("data-level", "INTERMEDIATE")

            await userEvent.click(typescript) // → ADVANCED
            expect(typescript).toHaveAttribute("data-level", "ADVANCED")

            await userEvent.click(typescript) // → removed
            expect(typescript).toHaveAttribute("aria-pressed", "false")
            expect(typescript).not.toHaveAttribute("data-level")
        })

        it("calls PUT with UserSkill array on cycle", async () => {
            let capturedBody: unknown = null
            server.use(
                http.put("*/api/profile/skills", async ({ request }) => {
                    capturedBody = await request.json()
                    return HttpResponse.json({ message: "Skills updated" })
                })
            )

            const userSkills: UserSkill[] = [{ skillId: "skill-1", level: "BASIC" }]
            render(<SkillSelector skills={mockSkills} userSkills={userSkills} />, {
                wrapper: createWrapper(),
            })

            await userEvent.click(screen.getByRole("button", { name: "React" }))

            await waitFor(() => {
                expect(capturedBody).toEqual({
                    skills: [
                        { skillId: "skill-1", level: "BASIC" },
                        { skillId: "skill-3", level: "BASIC" },
                    ],
                })
            })
        })
    })

    describe("error rollback", () => {
        it("reverts to unselected when PUT fails on first click", async () => {
            server.use(http.put("*/api/profile/skills", () => HttpResponse.error()))

            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "false")

            await userEvent.click(typescript)

            await waitFor(() => {
                expect(typescript).toHaveAttribute("aria-pressed", "false")
            })
        })

        it("reverts to previous level when PUT fails while cycling", async () => {
            server.use(http.put("*/api/profile/skills", () => HttpResponse.error()))

            const userSkills: UserSkill[] = [{ skillId: "skill-1", level: "BASIC" }]
            render(<SkillSelector skills={mockSkills} userSkills={userSkills} />, {
                wrapper: createWrapper(),
            })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "true")

            await userEvent.click(typescript) // tries INTERMEDIATE, fails → stays BASIC

            await waitFor(() => {
                expect(typescript).toHaveAttribute("aria-pressed", "true")
                expect(typescript).toHaveAttribute("data-level", "BASIC")
            })
        })
    })

    describe("feedback notification", () => {
        it("shows level message after first click", async () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            await userEvent.click(screen.getByRole("button", { name: "TypeScript" }))

            await waitFor(() => expect(screen.getByText("TypeScript — basic")).toBeInTheDocument())
        })

        it("shows removed message after cycling past ADVANCED", async () => {
            const userSkills: UserSkill[] = [{ skillId: "skill-1", level: "ADVANCED" }]
            render(<SkillSelector skills={mockSkills} userSkills={userSkills} />, {
                wrapper: createWrapper(),
            })

            await userEvent.click(screen.getByRole("button", { name: "TypeScript" }))

            await waitFor(() => expect(screen.getByText("TypeScript removed")).toBeInTheDocument())
        })
    })
})
