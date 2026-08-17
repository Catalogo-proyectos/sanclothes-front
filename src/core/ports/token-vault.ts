export type TokenKind = 'customerSession' | 'checkoutSession' | 'guestCart' | 'orderAccess';

export interface TokenVault {
  get(kind: Exclude<TokenKind, 'orderAccess'>): string | null;
  set(kind: Exclude<TokenKind, 'orderAccess'>, token: string): void;
  remove(kind: Exclude<TokenKind, 'orderAccess'>): void;
  getOrderAccess(orderId: string | number): string | null;
  setOrderAccess(orderId: string | number, token: string): void;
  removeOrderAccess(orderId: string | number): void;
  clearAll(): void;
}
