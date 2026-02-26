import { API_BASE, getAuthHeaders, getRequiredAuthHeaders } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  /** If true, throws when not authenticated. Default: false (returns null-safe). */
  requireAuth?: boolean;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Unified API client for /api/mobile endpoints.
 * Centralises auth header injection, JSON parsing, and error handling.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { requireAuth = false, body, method = body ? 'POST' : 'GET' } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(requireAuth
      ? await getRequiredAuthHeaders()
      : await getAuthHeaders()),
  };

  const fetchOptions: RequestInit = { method, headers };
  if (body) fetchOptions.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${path}`, fetchOptions);

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error');
    let message = text;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || text;
    } catch {
      // keep raw text
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}
