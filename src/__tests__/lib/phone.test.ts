import { describe, it, expect } from 'vitest';
import { formatPyLocal, isValidPyPhone, toPyE164, toPyLocalDigits } from '@/lib/phone';

describe('phone (Paraguay)', () => {
  it.each([
    ['0981123456', '981123456'],
    ['981123456', '981123456'],
    ['0981 123 456', '981123456'],
    ['+595 981 123 456', '981123456'],
    ['+595981123456', '981123456'],
    ['595981123456', '981123456'],
    ['(0981) 123-456', '981123456'],
    ['', ''],
    ['0', ''],
  ])('normaliza %s → %s', (raw, expected) => {
    expect(toPyLocalDigits(raw)).toBe(expected);
  });

  it('tipear "595981123456" dígito a dígito termina en el número local', () => {
    let stored = '';
    for (const ch of '595981123456') {
      const shown = formatPyLocal(toPyLocalDigits(stored));
      stored = toPyE164(toPyLocalDigits(shown + ch));
    }
    expect(stored).toBe('+595981123456');
  });

  it('tipear "0981123456" dígito a dígito descarta el 0 inicial', () => {
    let stored = '';
    for (const ch of '0981123456') {
      const shown = formatPyLocal(toPyLocalDigits(stored));
      stored = toPyE164(toPyLocalDigits(shown + ch));
    }
    expect(stored).toBe('+595981123456');
  });

  it('no deja pasar más de 9 dígitos locales', () => {
    expect(toPyLocalDigits('9811234567890')).toBe('981123456');
  });

  it('el valor guardado vuelve a leerse igual (round-trip)', () => {
    const stored = toPyE164(toPyLocalDigits('0981 123 456'));
    expect(stored).toBe('+595981123456');
    expect(toPyLocalDigits(stored)).toBe('981123456');
  });

  it('formatea en bloques de 3', () => {
    expect(formatPyLocal('981123456')).toBe('981 123 456');
    expect(formatPyLocal('9811')).toBe('981 1');
    expect(formatPyLocal('')).toBe('');
  });

  it.each([
    ['+595981123456', true],
    ['0981123456', true],
    ['+59598112345', false], // 8 dígitos
    ['+595211234567', false], // fijo, no celular
    ['', false],
  ])('isValidPyPhone(%s) = %s', (value, expected) => {
    expect(isValidPyPhone(value)).toBe(expected);
  });
});
