import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('အီးမေးလ်လိပ်စာကို မှန်ကန်စွာ ထည့်ပါ'),
  password: z.string().min(1, 'စကားဝှက် ထည့်ပါ'),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, 'ကုန်ပစ္စည်းအမည် ထည့်ပါ').max(120),
  price: z.number().finite().min(0, 'ဈေးနှုန်းသည် သုညထက် မနည်းရပါ'),
  category_id: z.string().nullable(),
  image: z.custom<File | null>((value) => value === null || (typeof File !== 'undefined' && value instanceof File)),
  remove_image: z.boolean(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'အမျိုးအစားအမည် ထည့်ပါ').max(100),
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(['cash', 'kpay', 'wavepay', 'banking']),
  discountAmount: z.number().finite().min(0),
  receivedAmount: z.number().finite().min(0),
  changeAmount: z.number().finite().min(0),
  finalTotal: z.number().finite().min(0),
}).refine((payment) => payment.paymentMethod !== 'cash' || payment.receivedAmount >= payment.finalTotal, {
  message: 'ပေးထားသောငွေသည် ကျသင့်ငွေထက် မနည်းရပါ',
  path: ['receivedAmount'],
});

export const cancellationSchema = z.object({
  reason: z.string().trim().min(1, 'ပယ်ဖျက်ရသည့်အကြောင်းရင်း ထည့်ပါ').max(500),
});

