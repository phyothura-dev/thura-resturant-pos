import { pb } from './pocketbase';
import { ClientResponseError } from 'pocketbase';
import type { DailyClosingRecord, SaleRecord, UserRecord } from '../types';

function getLocalDayRange(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function getSalesForClosing(date: string): Promise<SaleRecord[]> {
  const { start, end } = getLocalDayRange(date);
  return pb.collection('sales').getFullList({
    filter: `created >= "${start}" && created < "${end}"`,
    fields: 'id,created,status,total_amount,payment_method',
    sort: 'created',
    batch: 200,
  }) as unknown as Promise<SaleRecord[]>;
}

export async function getDailyClosing(date: string): Promise<DailyClosingRecord | null> {
  try {
    return await pb.collection('daily_closings').getFirstListItem(`business_date = "${date}"`) as unknown as DailyClosingRecord;
  } catch (error) {
    if (error instanceof ClientResponseError && error.status === 404) return null;
    throw error;
  }
}

export async function getRecentClosings() {
  return pb.collection('daily_closings').getList<DailyClosingRecord>(1, 30, {
    sort: '-business_date',
    fields: 'id,business_date,sales_count,total_sales,expected_cash,counted_cash,cash_difference,closed_by,created',
  });
}

export async function saveDailyClosing({ date, sales, countedCash, user }: {
  date: string;
  sales: SaleRecord[];
  countedCash: number | string;
  user: UserRecord | null;
}): Promise<DailyClosingRecord> {
  const completed = sales.filter((sale) => sale.status === 'completed');
  const cancelled = sales.filter((sale) => sale.status === 'cancelled');
  const byMethod = completed.reduce((totals, sale) => {
    const method = sale.payment_method || 'digital';
    totals[method] = (totals[method] || 0) + Number(sale.total_amount || 0);
    return totals;
  }, {});
  const expectedCash = byMethod.cash || 0;

  const record = await pb.collection('daily_closings').create({
    business_date: date,
    sales_count: completed.length,
    cancelled_count: cancelled.length,
    total_sales: completed.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0),
    cash_sales: expectedCash,
    kpay_sales: byMethod.kpay || 0,
    wavepay_sales: byMethod.wavepay || 0,
    banking_sales: byMethod.banking || 0,
    other_digital_sales: byMethod.digital || 0,
    expected_cash: expectedCash,
    counted_cash: Number(countedCash),
    cash_difference: Number(countedCash) - expectedCash,
    closed_by: user?.name || user?.email || 'Admin',
  });
  return record as unknown as DailyClosingRecord;
}
