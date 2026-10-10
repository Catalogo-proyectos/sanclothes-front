'use client';

import { useRef, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { openReceipt, uploadReceipt } from '@/lib/services/checkout';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

interface ReceiptUploaderProps {
  orderId: string;
  
  hasReceipt: boolean;
  
  readOnly?: boolean;
  onUploaded: () => void;
}

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
      } else if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        setError('No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
      } else {
        setError(err instanceof ApiError
          ? err.message
          : 'No se pudo subir el comprobante. Intentá nuevamente.');
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
            className="w-full inline-flex items-center justify-center gap-2 bg-[#f6f8f9] text-[#17191c] text-xs font-bold uppercase tracking-[0.16em] px-6 py-4 transition-colors hover:bg-white disabled:opacity-60 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
          >
            <Upload aria-hidden className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {uploading ? `Subiendo ${fileName}…` : hasReceipt ? 'Reemplazar comprobante' : 'Subir comprobante'}
            </span>
          </button>
        </>
      )}
      {hasReceipt && !uploading && (
        <button
          type="button"
          onClick={handleOpen}
          className="w-full inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-300 transition-colors hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
        >
          <FileText aria-hidden className="h-3.5 w-3.5 shrink-0" />
          Ver el comprobante que subí
        </button>
      )}
      {error && <p className="border-l-2 border-red-400 bg-red-500/15 px-3 py-2 text-xs font-mono font-bold text-red-200">{error}</p>}
    </div>
  );
}
