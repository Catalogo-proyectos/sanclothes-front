import type { TokenVault } from '../ports/token-vault';

const keys = {
  customerSession: 'trece13_auth_token',
  checkoutSession: 'sant_checkout_session_token',
  guestCart: 'sant_guest_cart_token',
} as const;

export class BrowserTokenVault implements TokenVault {
  private storage(kind: keyof typeof keys): Storage | null {
    if (typeof window === 'undefined') return null;
    return kind === 'checkoutSession' ? sessionStorage : localStorage;
  }

  get(kind: keyof typeof keys): string | null { return this.storage(kind)?.getItem(keys[kind]) ?? null; }
  set(kind: keyof typeof keys, token: string): void { this.storage(kind)?.setItem(keys[kind], token); }
  remove(kind: keyof typeof keys): void { this.storage(kind)?.removeItem(keys[kind]); }

  getOrderAccess(orderId: string | number): string | null {
    return typeof window === 'undefined' ? null : sessionStorage.getItem(`sant_order_access_token:${orderId}`);
  }
  setOrderAccess(orderId: string | number, token: string): void {
    if (typeof window !== 'undefined') sessionStorage.setItem(`sant_order_access_token:${orderId}`, token);
  }
  removeOrderAccess(orderId: string | number): void {
    if (typeof window !== 'undefined') sessionStorage.removeItem(`sant_order_access_token:${orderId}`);
  }
  clearAll(): void {
    this.remove('customerSession');
    this.remove('checkoutSession');
    this.remove('guestCart');
    if (typeof window !== 'undefined') {
      Object.keys(sessionStorage).filter((key) => key.startsWith('sant_order_access_token:'))
        .forEach((key) => sessionStorage.removeItem(key));
    }
  }
}
