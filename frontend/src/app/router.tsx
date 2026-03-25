import { BrowserRouter, Route, Routes } from "react-router-dom"
import { MarketOverviewPage } from "@/features/market/pages/MarketOverviewPage"
import { AuthCallbackPage } from "@/features/auth/pages/AuthCallbackPage"
import { ProfilePage } from "@/features/profile/pages/ProfilePage"

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MarketOverviewPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    )
}
