// Teléfonos de Paraguay. La tienda opera solo en PY: el prefijo +595 es fijo y
// el usuario carga únicamente su celular local. Se acepta cualquier forma en que
// lo escriba o pegue ("0981 123 456", "981123456", "+595 981 123 456",
// "595981123456") y se guarda siempre en formato internacional: +595981123456.

export const PY_COUNTRY_CODE = '+595';

/** Extrae los dígitos locales (sin 0 inicial ni código de país), máximo 9. */
export function toPyLocalDigits(raw: string): string {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+') && digits.startsWith('595')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('595') && digits.length > 9) {
    // "595981123456" pegado o tipeado sin el "+": un celular local nunca
    // supera los 9 dígitos, así que el excedente sólo puede ser el código.
    digits = digits.slice(3);
  }

  return digits.replace(/^0+/, '').slice(0, 9);
}

/** Celular paraguayo: 9 dígitos que empiezan con 9 (ej: 981 123 456). */
export function isValidPyMobile(localDigits: string): boolean {
  return /^9\d{8}$/.test(localDigits);
}

/** Valor a guardar/enviar: "+595XXXXXXXXX", o "" si no hay dígitos. */
export function toPyE164(localDigits: string): string {
  return localDigits ? `${PY_COUNTRY_CODE}${localDigits}` : '';
}

/** "981123456" → "981 123 456" (también formatea parciales). */
export function formatPyLocal(localDigits: string): string {
  return localDigits.replace(/^(\d{1,3})(\d{1,3})?(\d{1,3})?$/, (_, a: string, b?: string, c?: string) =>
    [a, b, c].filter(Boolean).join(' '),
  );
}

/** true si el valor guardado es un celular paraguayo completo y válido. */
export function isValidPyPhone(value: string): boolean {
  return isValidPyMobile(toPyLocalDigits(value));
}

export const PY_PHONE_ERROR = 'Ingresá un celular válido de 9 dígitos, ej: 981 123 456.';
