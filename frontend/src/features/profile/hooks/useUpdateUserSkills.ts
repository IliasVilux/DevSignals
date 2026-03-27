import { updateUserSkills } from "@/shared/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateUserSkills() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (skillIds: string[]) => updateUserSkills(skillIds),
        onMutate: (skillIds) => {
            const previous = queryClient.getQueryData(["profile", "skills"])
            queryClient.setQueryData(["profile", "skills"], { skillIds })
            return { previous }
        },
        onError: (_err, _vars, context) => {
            queryClient.setQueryData(["profile", "skills"], context?.previous)
        },
    })
}
