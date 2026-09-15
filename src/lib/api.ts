import { useAuthStore } from './authStore';

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';

export const getApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBase = rawApiBaseUrl.replace(/\/$/, '');

  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
};

type ApiErrorPayload = {
  message?: string;
};

export async function apiJson<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(getApiUrl(path), {
    ...init,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    let message = 'Request failed.';

    if (typeof payload === 'object' && payload !== null) {
      message = (payload as any).message || (payload as any).error || (payload as any).msg || 'Request failed.';
    } else if (typeof payload === 'string' && payload.trim().length > 0 && payload.length < 250) {
      message = payload.trim();
    }

    if (response.status === 401 && token) {
      useAuthStore.getState().logout();
    }

    throw new Error(message);
  }

  return payload as TResponse;
}
