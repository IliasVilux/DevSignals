const VITE_API_URL = import.meta.env.VITE_API_URL

if (!VITE_API_URL) {
    throw new Error('VITE_API_URL is not defined')
}

export async function apiFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${VITE_API_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    })

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
}