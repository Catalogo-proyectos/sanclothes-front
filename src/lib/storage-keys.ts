// Claves de localStorage del storefront.
//
// Antes del rebrand se llamaban "trece13_*". migrateLegacyStorageKey() las pasa
// una sola vez al nombre nuevo para no cerrar la sesión ni vaciar el carrito de
// quien ya tenía datos guardados. Las claves legacy solo se usan para migrar.

export const AUTH_TOKEN_KEY = 'sant_auth_token';
export const CART_STORAGE_KEY = 'sant_shopping_cart';

const LEGACY_KEYS: Record<string, string> = {
  [AUTH_TOKEN_KEY]: 'trece13_auth_token',
  [CART_STORAGE_KEY]: 'trece13_shopping_cart',
};

/** Copia el valor de la clave legacy a la nueva (si la nueva está vacía) y borra la legacy. */
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
    // localStorage bloqueado (modo privado estricto): no hay nada que migrar.
  }
}
