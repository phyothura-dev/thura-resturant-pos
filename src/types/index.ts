import type { z } from 'zod';
import type { cancellationSchema, categorySchema, loginSchema, paymentSchema, productSchema } from '../schemas';

export type UserRole = 'admin' | 'staff';

export type PaymentMethod = 'cash' | 'kpay' | 'wavepay' | 'banking' | 'digital';

export type SaleStatus = 'pending' | 'completed' | 'cancelled';

export type KitchenStatus = 'sent' | 'preparing' | 'ready' | 'served';

export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  user_metadata?: {
    role: UserRole;
    full_name: string;
  };
}

export interface CategoryRecord {
  id: string;
  name: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  image_url?: string;
  category_id?: string;
  categories?: Pick<CategoryRecord, 'id' | 'name'> | null;
}

export interface CartItem extends ProductRecord {
  quantity: number;
  notes?: string;
  saleItemId?: string;
}

export interface SaleRecord {
  id: string;
  created: string;
  table?: string;
  order_type?: 'dine_in' | 'takeaway';
  status: SaleStatus;
  total_amount: number;
  payment_method?: PaymentMethod;
  discount_amount?: number;
  received_amount?: number;
  change_amount?: number;
  kitchen_status?: KitchenStatus;
  kitchen_sent_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: string;
}

export interface DailyClosingRecord {
  id: string;
  business_date: string;
  sales_count: number;
  cancelled_count: number;
  total_sales: number;
  cash_sales: number;
  kpay_sales: number;
  wavepay_sales: number;
  banking_sales: number;
  other_digital_sales: number;
  expected_cash: number;
  counted_cash: number;
  cash_difference: number;
  closed_by: string;
  created: string;
}

export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type CancellationInput = z.infer<typeof cancellationSchema>;
