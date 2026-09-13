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
  const response = await fetch(getApiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null
        ? (payload as ApiErrorPayload).message || 'Request failed.'
        : 'Request failed.';

    throw new Error(message);
  }

  return payload as TResponse;
}
