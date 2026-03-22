import { AppProviders } from "./providers"
import { AppRouter } from "./router"
import { ErrorBoundary } from "./error-boundary"

export function App() {
    return (
        <AppProviders>
            <ErrorBoundary>
                <AppRouter />
            </ErrorBoundary>
        </AppProviders>
    )
}
