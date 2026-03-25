import { AuthStatus } from "@/features/auth"
import { Link } from "react-router-dom"

export function AppHeader() {
    return (
        <header className="border-b border-border px-6 py-6">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div>
                    <p className="text-xs text-muted-foreground tracking-widest uppercase mb-1">
                        Tech Job Market
                    </p>
                    <Link to="/">
                        <h1 className="font-display font-bold text-3xl hover:text-(--indigo) transition-colors duration-300">
                            DevSignals
                        </h1>
                    </Link>
                </div>
                <AuthStatus />
            </div>
        </header>
    )
}
