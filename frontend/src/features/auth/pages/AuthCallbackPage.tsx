import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

export function AuthCallbackPage() {
    const [params] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (params.get("success") === "true") {
            navigate("/", { replace: true })
        } else {
            navigate("/login", { replace: true })
        }
    }, [params, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Signing in...</p>
        </div>
    )
}
