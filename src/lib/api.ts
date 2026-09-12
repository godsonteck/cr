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
  let token = authToken;
  if (token === undefined) {
    const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminRoute) {
      token = localStorage.getItem('admin_auth_token') || localStorage.getItem('auth_token');
    } else {
      token = localStorage.getItem('auth_token') || localStorage.getItem('admin_auth_token');
    }
  }
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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000); // 30 second timeout
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      cache: options.method === 'GET' ? 'no-store' : options.cache,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. Please check your connection and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('admin_auth_token');
      const tokenKey = token && adminToken === token ? 'admin_auth_token' : 'auth_token';
      localStorage.removeItem(tokenKey);
      if (tokenKey === 'auth_token') {
        localStorage.removeItem('user_id');
        localStorage.removeItem('cr_user_profile');
      }
      window.dispatchEvent(new CustomEvent('cr-auth-expired', { detail: { tokenKey } }));
    }
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