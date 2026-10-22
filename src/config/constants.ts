export const APP_CONFIG = {
  TAX_RATE: 0.05, // commercial tax
  SERVICE_CHARGE_RATE: 0.05, // service charge 5%
  DEFAULT_PAGE_SIZE: 50,
  POCKETBASE_URL: import.meta.env?.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
  CURRENCY: 'ကျပ်',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
} as const;

export interface CalculationOptions {
  includeTax?: boolean;
  includeServiceCharge?: boolean;
  taxRate?: number;
  serviceChargeRate?: number;
}

export function calculateTotals(
  subtotal: number,
  options: CalculationOptions = {}
): { subtotal: number; tax: number; serviceCharge: number; total: number } {
  const safeSubtotal = Number(subtotal) || 0;
  const {
    includeTax = true,
    includeServiceCharge = false,
    taxRate = APP_CONFIG.TAX_RATE,
    serviceChargeRate = APP_CONFIG.SERVICE_CHARGE_RATE,
  } = options;

  const tax = includeTax ? Math.round(safeSubtotal * taxRate) : 0;
  const serviceCharge = includeServiceCharge ? Math.round(safeSubtotal * serviceChargeRate) : 0;
  const total = safeSubtotal + tax + serviceCharge;

  return { subtotal: safeSubtotal, tax, serviceCharge, total };
}
