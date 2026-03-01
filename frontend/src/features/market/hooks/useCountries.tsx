import { useQuery } from "@tanstack/react-query";
import { getCountries } from "../../../shared/api";

export function useCountries() {
    return useQuery({
        queryKey: ['countries'],
        queryFn: () => getCountries(),
    })
}