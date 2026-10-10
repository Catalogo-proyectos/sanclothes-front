import { config } from './config';
import { clearStoredSession, ensureCsrfToken, hasStoredSession, setCsrfToken } from './auth';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const SESSION_EXPIRED_EVENT = 'sant:session-expired';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function apiCall<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  requireAuth: boolean | string = false,
): Promise<T> {
  const normalizedMethod = method.toUpperCase();
  const useSession = requireAuth === true;

  if (useSession && !hasStoredSession()) {
    throw new ApiError('Iniciá sesión para continuar.', 401, 'UNAUTHORIZED');
  }

  const url = `${config.api.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const send = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof requireAuth === 'string') {
      headers.Authorization = `Bearer ${requireAuth}`;
    } else if (useSession && !SAFE_METHODS.has(normalizedMethod)) {
      const csrf = await ensureCsrfToken();
      if (csrf) headers['X-CSRF-Token'] = csrf;
    }

    return fetch(url, {
      method: normalizedMethod,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let response = await send();

  if (useSession && response.status === 403) {
    const code = await response
      .clone()
      .json()
      .then((data: { code?: string }) => data.code)
      .catch(() => undefined);

    if (code === 'CSRF_TOKEN_INVALID') {
      setCsrfToken(null);
      response = await send();
    }
  }

  if (useSession && response.status === 401) {
    clearStoredSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorCode: string | undefined;
    let errorData: Record<string, unknown> | undefined;

    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
      errorCode = errorJson.code || undefined;
      errorData = errorJson;
    } catch {

    }

    throw new ApiError(errorMessage, response.status, errorCode, errorData);
  }

  return response.json();
}
