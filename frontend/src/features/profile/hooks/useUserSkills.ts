import { useAuthContext } from "@/features/auth"
import { getUserSkills } from "@/shared/api"
import { useQuery } from "@tanstack/react-query"

export function useUserSkills() {
    const { isAuthenticated } = useAuthContext()
    return useQuery({
        queryKey: ["profile", "skills"],
        queryFn: () => getUserSkills(),
        enabled: isAuthenticated,
    })
}
