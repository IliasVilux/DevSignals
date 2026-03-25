import { getSkills } from "@/shared/api"
import { useQuery } from "@tanstack/react-query"

export function useSkills() {
    return useQuery({
        queryKey: ["skills"],
        queryFn: () => getSkills(),
    })
}
