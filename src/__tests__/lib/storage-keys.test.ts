import { beforeEach, describe, expect, it } from 'vitest';
import { AUTH_TOKEN_KEY, CART_STORAGE_KEY, migrateLegacyStorageKey } from '@/lib/storage-keys';

describe('migrateLegacyStorageKey', () => {
  beforeEach(() => localStorage.clear());

  it('pasa el token legacy a la clave nueva y borra la vieja', () => {
    localStorage.setItem('trece13_auth_token', 'jwt-viejo');
    migrateLegacyStorageKey(AUTH_TOKEN_KEY);
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('jwt-viejo');
    expect(localStorage.getItem('trece13_auth_token')).toBeNull();
  });

  it('no pisa un valor que ya existe con la clave nueva', () => {
    localStorage.setItem('trece13_shopping_cart', '{"viejo":true}');
    localStorage.setItem(CART_STORAGE_KEY, '{"nuevo":true}');
    migrateLegacyStorageKey(CART_STORAGE_KEY);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe('{"nuevo":true}');
    expect(localStorage.getItem('trece13_shopping_cart')).toBeNull();
  });

  it('no hace nada si no hay datos legacy', () => {
    migrateLegacyStorageKey(AUTH_TOKEN_KEY);
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
  });

  it('ignora claves sin equivalente legacy (ej. un storageKey custom por env)', () => {
    localStorage.setItem('trece13_auth_token', 'jwt-viejo');
    migrateLegacyStorageKey('custom_key');
    expect(localStorage.getItem('custom_key')).toBeNull();
    expect(localStorage.getItem('trece13_auth_token')).toBe('jwt-viejo');
  });
});
