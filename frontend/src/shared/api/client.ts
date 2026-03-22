const VITE_API_URL = import.meta.env.VITE_API_URL

if (!VITE_API_URL) {
    throw new Error("VITE_API_URL is not defined")
}

export class ApiError extends Error {
    readonly status: number

    constructor(status: number, message: string) {
        super(message)
        this.name = "ApiError"
        this.status = status
    }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${VITE_API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    })

    if (!response.ok) {
        let message = "Something went wrong. Please try again."
        try {
            const body = await response.json()
            if (typeof body?.error === "string" && body.error.length > 0) {
                message = body.error
            }
        } catch {
            // body wasn't JSON — keep default message
        }
        throw new ApiError(response.status, message)
    }

    return response.json()
}
