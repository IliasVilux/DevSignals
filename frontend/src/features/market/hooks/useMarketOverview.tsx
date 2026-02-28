import { useQuery } from "@tanstack/react-query"
import { getMarketOverview } from "../../../shared/api"

type params = {
    countryCode?: string
    role?: string
}

export function useMarketOverview(params: params) {
    return useQuery({
        queryKey: ['marketOverview', params],
        queryFn: () => getMarketOverview(params),
    })
}