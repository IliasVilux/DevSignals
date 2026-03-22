import { Component, type ReactNode, type ErrorInfo } from "react"

type Props = {
    children: ReactNode
}

type State = {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("[error boundary]", error, info.componentStack)
    }

    handleReset = () => {
        this.setState({ hasError: false })
    }

    render() {
        if (!this.state.hasError) return this.props.children

        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6">
                <div className="max-w-md w-full border border-border p-8 space-y-6">
                    <p className="text-xs text-destructive tracking-widest uppercase">
                        unexpected error
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Something went wrong. Please try again.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="text-xs tracking-widest uppercase border border-border px-4 py-2 hover:bg-accent transition-colors"
                    >
                        try again
                    </button>
                </div>
            </div>
        )
    }
}
