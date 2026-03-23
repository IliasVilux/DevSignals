import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MarketOverviewPage } from "../features/market"
import { AuthCallbackPage } from "../features/auth"

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MarketOverviewPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
            </Routes>
        </BrowserRouter>
    )
}
