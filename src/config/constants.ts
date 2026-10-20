export const APP_CONFIG = {
  TAX_RATE: 0.05, // commercial tax
  DEFAULT_PAGE_SIZE: 50,
  POCKETBASE_URL: import.meta.env?.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
  CURRENCY: 'ကျပ်',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export function calculateTotals(subtotal: number, taxRate: number = APP_CONFIG.TAX_RATE): { subtotal: number; tax: number; total: number } {
  const safeSubtotal = Number(subtotal) || 0;
  const tax = Math.round(safeSubtotal * taxRate);
  const total = safeSubtotal + tax;
  return { subtotal: safeSubtotal, tax, total };
}
