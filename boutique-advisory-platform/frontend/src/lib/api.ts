// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1000';

// Helper function to make API calls
export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const url = `${API_URL}${endpoint}`;

    // Add default headers
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
        ...options,
        headers,
    });
}

// Auth helper
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
}

// Authorized API request
export async function authorizedRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getAuthToken();
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return apiRequest(endpoint, {
        ...options,
        headers,
    });
}
