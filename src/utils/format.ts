/**
 * Utility functions for formatting numbers, currency (PYG - Guaraníes), and dates.
 */

export function formatCurrency(amount: number): string {
  // Format as Paraguayan Guaraní (Gs. 150.000)
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('PYG', 'Gs.');
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-PY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}
