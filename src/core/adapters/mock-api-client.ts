import type { ApiClient, RequestOptions } from '../ports/api-client';

export type MockHandler = <T>(method: string, path: string, body?: unknown, authenticated?: boolean) => Promise<T>;

export class MockApiClient implements ApiClient {
  constructor(private readonly handle: MockHandler) {}
  get<T>(path: string, options?: RequestOptions) { return this.handle<T>('GET', path, undefined, options?.auth?.kind !== 'none' && !!options?.auth); }
  post<T>(path: string, body?: unknown, options?: RequestOptions) { return this.handle<T>('POST', path, body, options?.auth?.kind !== 'none' && !!options?.auth); }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) { return this.handle<T>('PATCH', path, body, options?.auth?.kind !== 'none' && !!options?.auth); }
  postMultipart<T>(path: string, body: FormData, options?: RequestOptions) { return this.handle<T>('POST', path, body, options?.auth?.kind !== 'none' && !!options?.auth); }
  async getBlob(path: string, options?: RequestOptions): Promise<Blob> {
    const result = await this.handle<Blob | BlobPart>('GET', path, undefined, options?.auth?.kind !== 'none' && !!options?.auth);
    return result instanceof Blob ? result : new Blob([result]);
  }
}
