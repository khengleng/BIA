// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-c9de.up.railway.app';

// CSRF Token Management
let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string | null> | null = null;

async function ensureCsrfToken(): Promise<void> {
    if (csrfToken) return;
    if (csrfTokenPromise) {
        await csrfTokenPromise;
        return;
    }

    csrfTokenPromise = fetch(`${API_URL}/api/csrf-token`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            csrfToken = data.csrfToken;
            return csrfToken;
        })
        .catch(err => {
            console.error('Failed to fetch CSRF token', err);
            return null;
        });

    await csrfTokenPromise;
    csrfTokenPromise = null;
}

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

    // Add CSRF token for state-changing methods
    const method = options.method?.toUpperCase() || 'GET';
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        await ensureCsrfToken();
        if (csrfToken) {
            headers.set('x-csrf-token', csrfToken);
        }
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Ensure cookies are sent (for HttpOnly auth)
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
