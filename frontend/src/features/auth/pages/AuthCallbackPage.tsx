import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function AuthCallbackPage() {
    const navigate = useNavigate()

    useEffect(() => {
        navigate("/", { replace: true })
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Signing in...</p>
        </div>
    )
}
