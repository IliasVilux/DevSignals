import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { AuthCallbackPage } from "../../features/auth/pages/AuthCallbackPage"

function renderWithRouter(initialEntry: string) {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/" element={<div>Home</div>} />
                <Route path="/login" element={<div>Login</div>} />
            </Routes>
        </MemoryRouter>
    )
}

describe("AuthCallbackPage", () => {
    it("redirects to home when success=true", async () => {
        renderWithRouter("/auth/callback?success=true")
        expect(await screen.findByText("Home")).toBeInTheDocument()
    })

    it("redirects to login when success param is missing", async () => {
        renderWithRouter("/auth/callback")
        expect(await screen.findByText("Login")).toBeInTheDocument()
    })

    it("redirects to login when success=false", async () => {
        renderWithRouter("/auth/callback?success=false")
        expect(await screen.findByText("Login")).toBeInTheDocument()
    })
})
