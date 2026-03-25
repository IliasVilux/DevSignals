import { updateUserSkills } from "@/shared/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useUpdateUserSkills() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (skillIds: string[]) => updateUserSkills(skillIds),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["profile", "skills"] })
        },
    })
}
