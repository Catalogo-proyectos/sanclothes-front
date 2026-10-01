'use client';

import { useEffect, useRef } from 'react';
import {
  PY_COUNTRY_CODE,
  PY_PHONE_ERROR,
  formatPyLocal,
  isValidPyMobile,
  toPyE164,
  toPyLocalDigits,
} from '@/lib/phone';

type PhoneInputProps = {
  id?: string;
  name?: string;
  /** Valor guardado: "+595XXXXXXXXX", vacío, o un formato viejo ("0981…"). */
  value: string;
  /** Recibe siempre "+595XXXXXXXXX" (o "" si se vació el campo). */
  onChange: (value: string) => void;
  required?: boolean;
  /** Clases del input del formulario que lo contiene, para mantener su estilo. */
  className?: string;
  prefixClassName?: string;
};

/**
 * Celular paraguayo con el prefijo +595 fijo (no editable ni borrable).
 * Normaliza lo que el usuario escriba o pegue y marca el campo inválido con
 * setCustomValidity, así el submit nativo del form lo bloquea sin que cada
 * formulario tenga que validar por su cuenta.
 */
export default function PhoneInput({
  id,
  name = 'phone',
  value,
  onChange,
  required = false,
  className = '',
  prefixClassName = '',
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const localDigits = toPyLocalDigits(value);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const isEmpty = localDigits.length === 0;
    const invalid = isEmpty ? required : !isValidPyMobile(localDigits);
    input.setCustomValidity(invalid ? PY_PHONE_ERROR : '');
  }, [localDigits, required]);

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none pl-3.5 font-mono ${prefixClassName}`}
      >
        {PY_COUNTRY_CODE}
      </span>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        placeholder="981 123 456"
        aria-label={`Celular, código de país ${PY_COUNTRY_CODE}`}
        value={formatPyLocal(localDigits)}
        onChange={(e) => onChange(toPyE164(toPyLocalDigits(e.target.value)))}
        className={`${className} pl-16!`}
      />
    </div>
  );
}
