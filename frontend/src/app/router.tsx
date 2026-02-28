import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MarketOverviewPage } from "../features/market";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MarketOverviewPage />} />
            </Routes>
        </BrowserRouter>
    )
}