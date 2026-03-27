import { AppHeader } from "@/shared/ui/AppHeader"
import { Skeleton } from "@/shared/ui/skeleton"
import { useSkills, useUserSkills } from "../hooks"
import { SkillSelector } from "../components/SkillSelector"

export function ProfilePage() {
    const {
        data: allSkills,
        isLoading: allSkillsLoading,
        isError: allSkillsIsError,
        refetch: refetchSkills,
    } = useSkills()
    const {
        data: userSkills,
        isLoading: userSkillsLoading,
        isError: userSkillsIsError,
    } = useUserSkills()

    const isLoading = allSkillsLoading || userSkillsLoading
    const isError = allSkillsIsError || userSkillsIsError

    return (
        <div className="min-h-screen">
            <AppHeader />

            <main className="max-w-6xl mx-auto px-8 py-6">
                <p className="text-xs text-muted-foreground tracking-widest uppercase mb-8">
                    profile
                </p>

                {isLoading && (
                    <div aria-live="polite" className="space-y-12">
                        <span className="sr-only">loading profile</span>
                        <Skeleton className="h-6 w-30" />
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="mb-2">
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <Skeleton key={j} className="h-8" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="py-16 flex flex-col items-center gap-4 text-center">
                        <p className="text-xs text-destructive tracking-widest uppercase">
                            failed to load profile
                        </p>
                        <button
                            onClick={() => refetchSkills()}
                            className="text-xs tracking-widest uppercase border border-border px-5 py-2 hover:bg-accent transition-colors cursor-pointer"
                        >
                            retry
                        </button>
                    </div>
                )}

                {allSkills && userSkills && (
                    <SkillSelector skills={allSkills} userSkills={userSkills.skillIds} />
                )}
            </main>
        </div>
    )
}
