import { createContext } from "react"
import type { AuthUser } from "@/shared/api/types"

export interface AuthContextValue {
    user: AuthUser | null
    isLoading: boolean
    isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
