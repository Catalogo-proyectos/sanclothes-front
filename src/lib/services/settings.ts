import { apiCall } from '@/lib/api';

/** Datos bancarios para pago por transferencia (Configuración → "Datos para transferencia" en el admin). */
export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ruc?: string;
  accountType?: string;
  alias?: string;
  notes?: string;
}

interface PublicSetting {
  key: string;
  value: string;
}

/** Interpreta el valor del setting; null si está vacío, mal formado o incompleto. */
export function parseBankTransferInfo(value: string | null | undefined): BankTransferInfo | null {
  if (!value?.trim()) return null;
  try {
    const info = JSON.parse(value) as Partial<BankTransferInfo>;
    if (!info.bankName?.trim() || !info.accountHolder?.trim() || !info.accountNumber?.trim()) return null;
    return info as BankTransferInfo;
  } catch {
    return null;
  }
}

/** Lee los datos de transferencia públicos. Si no están configurados (o falla la API), devuelve null. */
export async function fetchBankTransferInfo(): Promise<BankTransferInfo | null> {
  try {
    const rows = await apiCall<PublicSetting[]>('GET', '/v1/settings');
    const row = (rows ?? []).find((r) => r.key === 'bank_transfer_info');
    return parseBankTransferInfo(row?.value);
  } catch {
    return null;
  }
}
