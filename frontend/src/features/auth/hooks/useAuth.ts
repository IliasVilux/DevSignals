import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/shared/api/client"
import type { AuthUser } from "@/shared/api/types"

async function fetchMe(): Promise<AuthUser> {
    return apiFetch<AuthUser>("/auth/me")
}

export function useAuth() {
    const { data: user, isLoading } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: fetchMe,
        retry: false,
        staleTime: 1000 * 60 * 5,
    })

    return {
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
    }
}
