import { AppHeader } from "@/shared/ui/AppHeader"

export function ProfilePage() {
    return (
        <div className="min-h-screen">
            <AppHeader />

            <main className="max-w-6xl mx-auto">
                <div className="px-8 py-12">
                    <p className="text-xs text-muted-foreground tracking-widest uppercase">
                        profile
                    </p>
                </div>
            </main>
        </div>
    )
}
