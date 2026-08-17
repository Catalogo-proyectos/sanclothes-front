export type AuthRequirement =
  | { kind: 'none' }
  | { kind: 'customerSession' }
  | { kind: 'checkoutSession' }
  | { kind: 'guestCart' }
  | { kind: 'orderAccess'; orderId: string | number };

export interface RequestOptions {
  auth?: AuthRequirement;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export interface ApiClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  postMultipart<T>(path: string, body: FormData, options?: RequestOptions): Promise<T>;
  getBlob(path: string, options?: RequestOptions): Promise<Blob>;
}
