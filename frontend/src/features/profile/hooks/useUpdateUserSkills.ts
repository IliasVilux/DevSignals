import { updateUserSkills } from "@/shared/api"
import type { UserSkill } from "@/shared/api/types"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateUserSkills() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (skills: UserSkill[]) => updateUserSkills(skills),
        onMutate: (skills) => {
            const previous = queryClient.getQueryData(["profile", "skills"])
            queryClient.setQueryData(["profile", "skills"], { skills })
            return { previous }
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(["profile", "skills"], context?.previous)
        },
    })
}
