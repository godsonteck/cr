const API_BASE = import.meta.env.VITE_API_BASE || '/api';

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  authToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add auth headers if available
  const token = authToken || localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const userId = localStorage.getItem('user_id');
  if (userId) {
    headers['x-user-id'] = userId;
  } else {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
        ? crypto.randomUUID()
        : 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('session_id', sessionId);
    }
    headers['x-session-id'] = sessionId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Request failed', data);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, authToken?: string | null) => request<T>(endpoint, { method: 'GET' }, authToken),
  post: <T>(endpoint: string, body: any, authToken?: string | null) => request<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }, authToken),
  patch: <T>(endpoint: string, body: any, authToken?: string | null) => request<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }, authToken),
  delete: <T>(endpoint: string, authToken?: string | null) => request<T>(endpoint, { method: 'DELETE' }, authToken),
};

export { ApiError };