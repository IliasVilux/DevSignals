import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TooltipProvider } from "@/shared/ui/tooltip"

type Props = {
    children: ReactNode
}

const queryClient = new QueryClient()

export function AppProviders({ children }: Props) {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>{children}</TooltipProvider>
        </QueryClientProvider>
    )
}
