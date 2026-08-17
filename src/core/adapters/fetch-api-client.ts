import { ApiError } from '../errors/api-error';
import type { ApiClient, AuthRequirement, RequestOptions } from '../ports/api-client';
import type { TokenVault } from '../ports/token-vault';

export class FetchApiClient implements ApiClient {
  constructor(private readonly baseUrl: string, private readonly tokens: TokenVault) {}

  get<T>(path: string, options?: RequestOptions) { return this.request<T>('GET', path, undefined, options); }
  post<T>(path: string, body?: unknown, options?: RequestOptions) { return this.request<T>('POST', path, body, options); }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) { return this.request<T>('PATCH', path, body, options); }
  postMultipart<T>(path: string, body: FormData, options?: RequestOptions) { return this.request<T>('POST', path, body, options); }
  getBlob(path: string, options?: RequestOptions) { return this.request<Blob>('GET', path, undefined, options, true); }

  private tokenFor(auth: AuthRequirement): string | null {
    return auth.kind === 'orderAccess' ? this.tokens.getOrderAccess(auth.orderId)
      : auth.kind === 'none' ? null : this.tokens.get(auth.kind);
  }

  private async request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}, blob = false): Promise<T> {
    const auth = options.auth ?? { kind: 'none' };
    const token = this.tokenFor(auth);
    if (auth.kind !== 'none' && !token) throw new ApiError('Falta la credencial requerida', 401, 'MISSING_TOKEN');
    const multipart = typeof FormData !== 'undefined' && body instanceof FormData;
    const headers: Record<string, string> = { ...options.headers };
    if (body !== undefined && !multipart) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`, {
      method, headers, signal: options.signal,
      body: body === undefined ? undefined : multipart ? body : JSON.stringify(body),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new ApiError(String(details.message ?? details.error ?? 'Ocurrió un error inesperado'), response.status, String(details.code ?? 'HTTP_ERROR'), details);
    }
    if (response.status === 204) return undefined as T;
    return (blob ? response.blob() : response.json()) as Promise<T>;
  }
}
