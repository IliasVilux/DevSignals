import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SkillSelector } from "../../features/profile/components/SkillSelector"
import { server } from "../mocks/server"
import { http, HttpResponse } from "msw"
import type { Skill } from "@/shared/api/types"

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
            render(<SkillSelector skills={mockSkills} userSkills={["skill-1", "skill-3"]} />, {
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

    describe("toggle interaction", () => {
        it("selects an unselected skill on click", async () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "false")

            await userEvent.click(typescript)

            expect(typescript).toHaveAttribute("aria-pressed", "true")
        })

        it("deselects a selected skill on click", async () => {
            render(<SkillSelector skills={mockSkills} userSkills={["skill-1"]} />, {
                wrapper: createWrapper(),
            })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "true")

            await userEvent.click(typescript)

            expect(typescript).toHaveAttribute("aria-pressed", "false")
        })

        it("calls PUT with updated skill ids on toggle", async () => {
            let capturedBody: unknown = null
            server.use(
                http.put("*/api/profile/skills", async ({ request }) => {
                    capturedBody = await request.json()
                    return HttpResponse.json({ message: "Skills updated" })
                })
            )

            render(<SkillSelector skills={mockSkills} userSkills={["skill-1"]} />, {
                wrapper: createWrapper(),
            })

            await userEvent.click(screen.getByRole("button", { name: "React" }))

            await waitFor(() => {
                expect(capturedBody).toEqual({ skillIds: ["skill-1", "skill-3"] })
            })
        })
    })

    describe("error rollback", () => {
        it("reverts selection when PUT fails", async () => {
            server.use(http.put("*/api/profile/skills", () => HttpResponse.error()))

            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "false")

            await userEvent.click(typescript)

            await waitFor(() => {
                expect(typescript).toHaveAttribute("aria-pressed", "false")
            })
        })

        it("reverts deselection when PUT fails", async () => {
            server.use(http.put("*/api/profile/skills", () => HttpResponse.error()))

            render(<SkillSelector skills={mockSkills} userSkills={["skill-1"]} />, {
                wrapper: createWrapper(),
            })

            const typescript = screen.getByRole("button", { name: "TypeScript" })
            expect(typescript).toHaveAttribute("aria-pressed", "true")

            await userEvent.click(typescript)

            await waitFor(() => {
                expect(typescript).toHaveAttribute("aria-pressed", "true")
            })
        })
    })

    describe("feedback notification", () => {
        it("shows added message after selecting a skill", async () => {
            render(<SkillSelector skills={mockSkills} />, { wrapper: createWrapper() })

            await userEvent.click(screen.getByRole("button", { name: "TypeScript" }))

            await waitFor(() => expect(screen.getByText("TypeScript added")).toBeInTheDocument())
        })

        it("shows removed message after deselecting a skill", async () => {
            render(<SkillSelector skills={mockSkills} userSkills={["skill-1"]} />, {
                wrapper: createWrapper(),
            })

            await userEvent.click(screen.getByRole("button", { name: "TypeScript" }))

            await waitFor(() => expect(screen.getByText("TypeScript removed")).toBeInTheDocument())
        })
    })
})
