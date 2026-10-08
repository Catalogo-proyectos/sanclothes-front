'use client';

import { useRef, useState } from 'react';
import { ApiError } from '@/lib/api';
import { openReceipt, uploadReceipt } from '@/lib/services/checkout';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

interface ReceiptUploaderProps {
  orderId: string;
  /** Ya hay un comprobante cargado (se puede reemplazar o ver). */
  hasReceipt: boolean;
  /** Solo ver el comprobante (el pedido ya no acepta uno nuevo). */
  readOnly?: boolean;
  onUploaded: () => void;
}

/**
 * Un solo botón: abre el selector de archivos (en el celular, cámara o galería)
 * y sube apenas se elige. Antes había un input casi invisible al lado de un
 * botón "Subir" que sin archivo elegido no hacía nada.
 */
export default function ReceiptUploader({ orderId, hasReceipt, readOnly = false, onUploaded }: ReceiptUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Formato no permitido. Subí una foto (JPG, PNG, WebP) o un PDF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('El archivo supera los 5 MB.');
      return;
    }
    setFileName(file.name);
    setUploading(true);
    try {
      await uploadReceipt(orderId, file);
      onUploaded();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'INVALID_ORDER_STATUS') {
        setError('Este pedido ya no acepta comprobantes (venció el plazo o ya fue revisado). Recargá la página.');
      } else if (err instanceof ApiError && err.code === 'ORDER_STATE_CHANGED') {
        setError('El pedido cambió mientras se subía el archivo. Recargá la página.');
      } else if (err instanceof ApiError && err.code === 'INVALID_FILE_TYPE') {
        setError('El archivo no es una imagen o PDF válido.');
      } else {
        setError((err as Error).message || 'No se pudo subir el comprobante. Probá de nuevo.');
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleOpen = async () => {
    setError('');
    try {
      await openReceipt(orderId);
    } catch {
      setError('No se pudo abrir el comprobante.');
    }
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full bg-white text-black text-sm font-black uppercase tracking-wider px-4 py-3.5 rounded-xl hover:bg-slate-200 disabled:opacity-60"
          >
            {uploading ? `Subiendo ${fileName}...` : hasReceipt ? 'Reemplazar comprobante' : 'Subir comprobante'}
          </button>
        </>
      )}
      {hasReceipt && !uploading && (
        <button type="button" onClick={handleOpen} className="w-full text-xs text-slate-300 underline hover:text-white">
          Ver el comprobante que subí
        </button>
      )}
      {error && <p className="p-2 bg-red-500/20 text-red-300 text-xs font-bold rounded-lg">{error}</p>}
    </div>
  );
}
