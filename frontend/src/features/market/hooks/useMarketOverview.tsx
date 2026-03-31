import { useQuery } from "@tanstack/react-query"
import { getMarketOverview } from "@/shared/api"

type Params = {
    countryCode?: string
    role?: string
}

export function useMarketOverview(params: Params) {
    return useQuery({
        queryKey: ["marketOverview", params],
        queryFn: () => getMarketOverview(params),
    })
}
