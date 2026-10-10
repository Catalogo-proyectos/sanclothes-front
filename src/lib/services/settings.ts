import { apiCall } from '@/lib/api';

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

export async function fetchBankTransferInfo(): Promise<BankTransferInfo | null> {
  try {
    const rows = await apiCall<PublicSetting[]>('GET', '/v1/settings');
    const row = (rows ?? []).find((r) => r.key === 'bank_transfer_info');
    return parseBankTransferInfo(row?.value);
  } catch {
    return null;
  }
}
