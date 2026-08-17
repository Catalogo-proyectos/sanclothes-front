export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Compatibility alias while existing screens migrate to `details`. */
  get data(): Record<string, unknown> | undefined {
    return this.details as Record<string, unknown> | undefined;
  }
}
