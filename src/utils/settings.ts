export interface AppSettings {
  restaurantName: string;
  phone: string;
  address: string;
  receiptFooter: string;
  enableTax: boolean;
  taxRate: number; // e.g. 5 for 5%
  enableServiceCharge: boolean;
  serviceChargeRate: number; // e.g. 5 for 5%
  defaultPaperSize: '80mm' | '58mm';
}

export const DEFAULT_SETTINGS: AppSettings = {
  restaurantName: 'သူရစားသောက်ဆိုင်',
  phone: '09-123456789',
  address: 'ရန်ကုန်မြို့',
  receiptFooter: 'ကျေးဇူးတင်ပါသည်၊ နောက်တစ်ခေါက် ပြန်လည်ကြိုဆိုပါသည်',
  enableTax: false,
  taxRate: 5,
  enableServiceCharge: false,
  serviceChargeRate: 5,
  defaultPaperSize: '80mm',
};

const STORAGE_KEY = 'pos_restaurant_settings';

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('app_settings_changed'));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}
