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
  
  value: string;
  
  onChange: (value: string) => void;
  required?: boolean;
  
  className?: string;
  prefixClassName?: string;
};

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
