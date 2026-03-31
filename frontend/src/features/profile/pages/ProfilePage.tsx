import { AppHeader } from "@/shared/ui/AppHeader"
import { Skeleton } from "@/shared/ui/skeleton"
import { useSkills, useUserSkills } from "../hooks"
import { SkillSelector } from "../components/SkillSelector"

const SKELETON_CATEGORY_WIDTHS = ["w-20", "w-28", "w-16"]

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
        refetch: refetchUserSkills,
    } = useUserSkills()

    const isLoading = allSkillsLoading || userSkillsLoading
    const isError = allSkillsIsError || userSkillsIsError

    return (
        <div className="min-h-screen">
            <AppHeader />

            <main className="max-w-6xl mx-auto">
                {/* Page label — mirrors the filter bar pattern from MarketOverviewPage */}
                <div className="border-b border-border px-8 py-3 md:border-x">
                    <p className="text-xs text-muted-foreground tracking-widest uppercase">
                        profile
                    </p>
                </div>

                {isLoading && (
                    <div aria-live="polite">
                        <span className="sr-only">loading profile</span>
                        {/* Title skeleton */}
                        <div className="md:border-x border-b border-border px-8 py-6">
                            <Skeleton className="h-7 w-48" />
                        </div>
                        {/* Category skeletons */}
                        {SKELETON_CATEGORY_WIDTHS.map((width) => (
                            <div key={width} className="md:border-x border-b border-border">
                                <div className="px-8 pt-5 pb-3">
                                    <Skeleton className={`h-3 ${width}`} />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 px-8 pb-6">
                                    {[1, 2, 3, 4, 5, 6].map((m) => (
                                        <Skeleton key={m} className="h-10" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="md:border-x border-b border-border px-8 py-16 flex flex-col items-center gap-4 text-center">
                        <p className="text-xs text-destructive tracking-widest uppercase">
                            failed to load profile
                        </p>
                        <button
                            onClick={() => {
                                refetchSkills()
                                refetchUserSkills()
                            }}
                            className="text-xs tracking-widest uppercase border border-border px-5 py-2 hover:bg-accent transition-colors cursor-pointer"
                        >
                            retry
                        </button>
                    </div>
                )}

                {allSkills && userSkills && (
                    <SkillSelector skills={allSkills} userSkills={userSkills.skills} />
                )}
            </main>
        </div>
    )
}
