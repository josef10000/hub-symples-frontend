
// Base URL from environment variables or default to localhost for dev
const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  data?: any;
}

// --- REAL API HANDLER ---
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, method: 'GET', headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return await handleResponse(response);
  },
  post: async <T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> => {
    const isFormData = data instanceof FormData;
    const headers: HeadersInit = isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers };
    const body = isFormData ? data : JSON.stringify(data);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, method: 'POST', headers, body,
    });
    return await handleResponse(response);
  },
  put: async <T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, method: 'PUT', headers: { 'Content-Type': 'application/json', ...options.headers }, body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },
  delete: async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options, method: 'DELETE', headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    return await handleResponse(response);
  }
};
