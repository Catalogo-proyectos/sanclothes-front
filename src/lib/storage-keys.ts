

export const AUTH_TOKEN_KEY = 'sant_auth_token';
export const CART_STORAGE_KEY = 'sant_shopping_cart';

const LEGACY_KEYS: Record<string, string> = {
  [AUTH_TOKEN_KEY]: 'trece13_auth_token',
  [CART_STORAGE_KEY]: 'trece13_shopping_cart',
};

export function migrateLegacyStorageKey(key: string): void {
  if (typeof window === 'undefined') return;
  const legacyKey = LEGACY_KEYS[key];
  if (!legacyKey || legacyKey === key) return;
  try {
    const legacyValue = window.localStorage.getItem(legacyKey);
    if (legacyValue === null) return;
    if (window.localStorage.getItem(key) === null) {
      window.localStorage.setItem(key, legacyValue);
    }
    window.localStorage.removeItem(legacyKey);
  } catch {
    
  }
}
