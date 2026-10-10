

export const PY_COUNTRY_CODE = '+595';

export function toPyLocalDigits(raw: string): string {
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+') && digits.startsWith('595')) {
    digits = digits.slice(3);
  } else if (digits.startsWith('595') && digits.length > 9) {

digits = digits.slice(3);
  }

  return digits.replace(/^0+/, '').slice(0, 9);
}

export function isValidPyMobile(localDigits: string): boolean {
  return /^9\d{8}$/.test(localDigits);
}

export function toPyE164(localDigits: string): string {
  return localDigits ? `${PY_COUNTRY_CODE}${localDigits}` : '';
}

export function formatPyLocal(localDigits: string): string {
  return localDigits.replace(/^(\d{1,3})(\d{1,3})?(\d{1,3})?$/, (_, a: string, b?: string, c?: string) =>
    [a, b, c].filter(Boolean).join(' '),
  );
}

export function isValidPyPhone(value: string): boolean {
  return isValidPyMobile(toPyLocalDigits(value));
}

export const PY_PHONE_ERROR = 'Ingresá un celular válido de 9 dígitos, ej: 981 123 456.';
