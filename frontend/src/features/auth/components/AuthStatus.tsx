import { useQueryClient } from "@tanstack/react-query"
import { useAuthContext } from "../AuthContext"
import { GitHub, Google } from "@/shared/ui/Icons"
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar"
import { Separator } from "@/shared/ui/separator"

const VITE_API_URL = import.meta.env.VITE_API_URL as string

export function AuthStatus() {
    const { user, isLoading, isAuthenticated } = useAuthContext()
    const queryClient = useQueryClient()

    async function handleLogout() {
        await fetch(`${VITE_API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        })
        queryClient.setQueryData(["auth", "me"], null)
    }

    if (isLoading) return null

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col sm:flex-row items-stretch border border-border">
                <span className="flex items-center justify-center px-3 py-1.5 text-xs text-muted-foreground tracking-widest uppercase">
                    sign in
                </span>

                <Separator className="sm:hidden" orientation="horizontal" />
                <Separator className="hidden sm:block" orientation="vertical" />

                <div className="flex items-stretch">
                    <a
                        href={`${VITE_API_URL}/auth/google`}
                        className="flex flex-1 items-center justify-center px-5 sm:px-3 py-3 sm:py-1.5 hover:bg-accent transition-colors"
                    >
                        <Google className="pointer-events-none" width={16} height={16} />
                    </a>

                    <Separator orientation="vertical" />

                    <a
                        href={`${VITE_API_URL}/auth/github`}
                        className="flex flex-1 items-center justify-center px-5 sm:px-3 py-3 sm:py-1.5 hover:bg-accent transition-colors"
                    >
                        <GitHub className="pointer-events-none" width={16} height={16} />
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="flex border border-border">
            <div className="flex items-center gap-3 px-2 sm:px-3 py-2 sm:py-1.5">
                <div className="relative shrink-0">
                    <Avatar>
                        <AvatarImage src={user?.picture ?? undefined} alt={user?.name} />
                        <AvatarFallback className="text-xs">
                            {user?.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center bg-background border border-border size-3.5">
                        {
                            {
                                google: (
                                    <Google
                                        width={9}
                                        height={9}
                                        style={{ color: "var(--indigo)" }}
                                    />
                                ),
                                github: (
                                    <GitHub
                                        width={9}
                                        height={9}
                                        style={{ color: "var(--indigo)" }}
                                    />
                                ),
                            }[user?.provider as string]
                        }
                    </span>
                </div>

                <span className="text-xs text-muted-foreground tracking-wide hidden sm:block truncate max-w-36 capitalize">
                    {user?.name}
                </span>
            </div>

            <Separator orientation="vertical" />

            <button
                onClick={handleLogout}
                className="px-3 text-xs text-muted-foreground tracking-widest uppercase hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
                sign out
            </button>
        </div>
    )
}
