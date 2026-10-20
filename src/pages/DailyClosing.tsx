import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, ClipboardCheck, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getDailyClosing, getRecentClosings, getSalesForClosing, saveDailyClosing } from '../services/apiClosings';
import { APP_CONFIG } from '../config/constants';
import { formatDate } from '../utils/format';
import type { ReactNode } from 'react';
import type { DailyClosingRecord, SaleRecord } from '../types';

function localDateValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Money({ value }: { value: number | null | undefined }) {
  return <>{Number(value || 0).toLocaleString()} {APP_CONFIG.CURRENCY}</>;
}

function SummaryCard({ title, value, icon, tone = 'emerald' }: { title: string; value: ReactNode; icon: ReactNode; tone?: 'emerald' | 'amber' }) {
  return (
    <Card className="border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm text-gray-500">{title}</p><p className="mt-2 text-xl font-black text-gray-900">{value}</p></div>
        <div className={`rounded-xl p-2.5 ${tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{icon}</div>
      </div>
    </Card>
  );
}

export default function DailyClosing() {
  const [date, setDate] = useState(() => localDateValue());
  const [countedCash, setCountedCash] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: salesLoading, isError: salesError } = useQuery<SaleRecord[]>({
    queryKey: ['closingSales', date],
    queryFn: () => getSalesForClosing(date),
  });
  const { data: closing, isLoading: closingLoading, isError: closingError } = useQuery<DailyClosingRecord | null>({
    queryKey: ['dailyClosing', date],
    queryFn: () => getDailyClosing(date),
  });
  const { data: recentResult } = useQuery({ queryKey: ['recentClosings'], queryFn: getRecentClosings });
  const recentClosings = recentResult?.items || [];

  const summary = useMemo(() => {
    const completed = sales.filter((sale) => sale.status === 'completed');
    const cancelled = sales.filter((sale) => sale.status === 'cancelled');
    const pending = sales.filter((sale) => sale.status === 'pending');
    const payments = completed.reduce<Record<string, number>>((totals, sale) => {
      const method = sale.payment_method || 'digital';
      totals[method] = (totals[method] || 0) + Number(sale.total_amount || 0);
      return totals;
    }, {});
    return {
      completed,
      cancelled,
      pending,
      payments,
      total: completed.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0),
      cash: payments.cash || 0,
    };
  }, [sales]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const latestSales = await getSalesForClosing(date);
      if (latestSales.some((sale) => sale.status === 'pending')) {
        throw new Error('မပြီးသေးတဲ့အော်ဒါရှိနေပါတယ်။ အရင်ငွေရှင်းပါ သို့မဟုတ် ပယ်ဖျက်ပါ။');
      }
      return saveDailyClosing({ date, sales: latestSales, countedCash, user });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyClosing', date] });
      queryClient.invalidateQueries({ queryKey: ['recentClosings'] });
      toast.success('နေ့စဉ်အရောင်းပိတ်စာရင်း သိမ်းပြီးပါပြီ');
    },
    onError: (error) => toast.error('အရောင်းပိတ်စာရင်း သိမ်းမရပါ', { description: error.message }),
  });

  const closingValue = closing || null;
  const difference = Number(countedCash || 0) - summary.cash;
  const savingBlocked = !countedCash.trim() || !Number.isFinite(Number(countedCash)) || Number(countedCash) < 0 || salesLoading || salesError || closingError || summary.pending.length > 0 || Boolean(closingValue) || saveMutation.isPending;

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700"><ClipboardCheck size={24} /></span>
          <div><h1 className="text-2xl font-black text-gray-900">နေ့စဉ် အရောင်းပိတ်စာရင်း</h1><p className="text-sm text-gray-500">နေ့ကုန်ရောင်းအားနဲ့ လက်ကျန်ငွေကို စစ်ဆေးသိမ်းဆည်းပါ</p></div>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
          <CalendarDays size={17} className="text-gray-400" />
          <span>ရက်စွဲ</span>
          <Input type="date" value={date} max={localDateValue()} onChange={(event) => { if (event.target.value) { setDate(event.target.value); setCountedCash(''); } }} className="h-9 w-auto border-0 p-1 shadow-none" />
        </label>
      </header>

      {salesError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">အရောင်းစာရင်းကို ဖတ်မရပါ။ ဆာဗာချိတ်ဆက်မှုကို စစ်ဆေးပါ။</div>}
      {closingError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">ဒီရက်အတွက် ပိတ်သိမ်းထား/မထားကို စစ်မရပါ။ ထပ်မံကြိုးစားပါ။</div>}
      {salesLoading || closingLoading ? <div className="flex h-32 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard title="ရောင်းပြီးအော်ဒါ" value={`${summary.completed.length} ခု`} icon={<CheckCircle2 size={20} />} />
            <SummaryCard title="ရောင်းအားစုစုပေါင်း" value={<Money value={summary.total} />} icon={<Wallet size={20} />} />
            <SummaryCard title="ငွေသားရောင်းအား" value={<Money value={summary.cash} />} icon={<Wallet size={20} />} tone="amber" />
            <SummaryCard title="ပယ်ဖျက်အော်ဒါ" value={`${summary.cancelled.length} ခု`} icon={<ClipboardCheck size={20} />} />
          </div>

          {summary.pending.length > 0 && !closingValue && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">မပြီးသေးတဲ့အော်ဒါ {summary.pending.length} ခု ရှိနေပါတယ်။ အရောင်းပိတ်မီ အော်ဒါအားလုံးကို ငွေရှင်းပါ သို့မဟုတ် ပယ်ဖျက်ပါ။</div>}

          <Card className="space-y-5 border-gray-100 p-5 shadow-sm">
            <div><h2 className="text-lg font-bold text-gray-900">ငွေပေးချေမှုအလိုက် စာရင်း</h2><p className="text-sm text-gray-500">ပယ်ဖျက်ထားတဲ့အော်ဒါတွေကို ရောင်းအားမှာ မထည့်ထားပါ</p></div>
            <div className="divide-y divide-gray-100">
              {[
                ['ငွေသား', summary.payments.cash],
                ['KBZPay', summary.payments.kpay],
                ['WavePay', summary.payments.wavepay],
                ['ဘဏ်ငွေလွှဲ', summary.payments.banking],
                ['အခြား ဒီဂျစ်တယ်', summary.payments.digital],
              ].map(([label, amount]) => <div key={label} className="flex justify-between py-2.5 text-sm"><span className="text-gray-600">{label}</span><strong className="text-gray-900"><Money value={amount} /></strong></div>)}
            </div>

            {closingValue ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 size={18} />ဒီနေ့စာရင်း ပိတ်ပြီးပါပြီ</div>
                <div className="mt-3 grid gap-2 text-sm text-emerald-900 sm:grid-cols-3">
                  <p>မျှော်မှန်းငွေသား: <b><Money value={closingValue.expected_cash} /></b></p>
                  <p>ရေတွက်ရရှိငွေ: <b><Money value={closingValue.counted_cash} /></b></p>
                  <p>ကွာဟချက်: <b><Money value={closingValue.cash_difference} /></b></p>
                </div>
                <p className="mt-2 text-xs text-emerald-800">ပိတ်သိမ်းသူ: {closingValue.closed_by} · {new Date(closingValue.created).toLocaleTimeString()}</p>
              </div>
            ) : (
              <div className="grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="space-y-1.5 text-sm font-medium text-gray-700">အံဆွဲထဲက တကယ်ရေတွက်ရရှိတဲ့ ငွေသား
                  <Input type="number" min="0" step="1" value={countedCash} onChange={(event) => setCountedCash(event.target.value)} placeholder="ဥပမာ - 250000" />
                </label>
                <div className={`rounded-xl p-3 ${difference < 0 ? 'bg-red-50 text-red-800' : difference > 0 ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-700'}`}>
                  <p className="text-xs">လက်ရှိကွာဟချက်</p><p className="mt-1 text-lg font-black"><Money value={countedCash === '' ? 0 : difference} /></p>
                  <p className="text-xs">{countedCash === '' ? 'ငွေသားရေတွက်ပြီး ထည့်ပါ' : difference < 0 ? 'ငွေလျော့နေသည်' : difference > 0 ? 'ငွေပိုနေသည်' : 'စာရင်းကိုက်ညီသည်'}</p>
                </div>
                <Button disabled={savingBlocked} isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                  <ClipboardCheck size={16} className="mr-2" />နေ့စာရင်းပိတ်မည်
                </Button>
              </div>
            )}
          </Card>

          <Card className="border-gray-100 p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-gray-900">နောက်ဆုံး ပိတ်သိမ်းထားသောရက်များ</h2>
            {recentClosings.length === 0 ? <p className="text-sm text-gray-500">ပိတ်သိမ်းမှတ်တမ်း မရှိသေးပါ</p> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm">
                <thead><tr className="border-b text-xs text-gray-500"><th className="py-2">နေ့ရက်</th><th>အော်ဒါ</th><th>ရောင်းအား</th><th>မျှော်မှန်းငွေသား</th><th>ရေတွက်ရရှိငွေ</th><th>ကွာဟချက်</th><th>ပိတ်သိမ်းသူ</th></tr></thead>
                <tbody>{recentClosings.map((record) => <tr key={record.id} className="border-b last:border-0"><td className="py-3">{formatDate(record.business_date)}</td><td>{record.sales_count}</td><td><Money value={record.total_sales} /></td><td><Money value={record.expected_cash} /></td><td><Money value={record.counted_cash} /></td><td className={record.cash_difference < 0 ? 'font-bold text-red-700' : record.cash_difference > 0 ? 'font-bold text-amber-700' : ''}><Money value={record.cash_difference} /></td><td>{record.closed_by}</td></tr>)}</tbody>
              </table></div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
