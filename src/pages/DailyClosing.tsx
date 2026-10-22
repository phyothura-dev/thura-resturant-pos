import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { getDailyClosing, getRecentClosings, getSalesForClosing, saveDailyClosing } from '../services/apiClosings';
import { APP_CONFIG } from '../config/constants';
import { formatDate, formatTime } from '../utils/format';
import type { DailyClosingRecord, SaleRecord } from '../types';

function localDateValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const Money = ({ value }: { value: number | null | undefined }) => (
  <>{Number(value || 0).toLocaleString()} {APP_CONFIG.CURRENCY}</>
);

const StatCard = ({ title, value, tone = 'gray' }: { title: string; value: React.ReactNode; tone?: 'gray' | 'amber' }) => (
  <Card className="border-gray-100 p-4 shadow-2xs">
    <p className="text-xs font-medium text-gray-500">{title}</p>
    <p className={`mt-1.5 text-xl font-black ${tone === 'amber' ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
  </Card>
);

const METHODS = [
  ['cash', 'ငွေသား'],
  ['kpay', 'KBZPay'],
  ['wavepay', 'WavePay'],
  ['banking', 'ဘဏ်ငွေလွှဲ'],
  ['digital', 'အခြား ဒစ်ဂျစ်တယ်'],
] as const;

export default function DailyClosing() {
  const [date, setDate] = useState(() => localDateValue());
  const [countedCash, setCountedCash] = useState('');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading: salesLoading, isError: salesError, refetch: refetchSales } = useQuery<SaleRecord[]>({
    queryKey: ['closingSales', date],
    queryFn: () => getSalesForClosing(date),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: closing, isLoading: closingLoading, isError: closingError, refetch: refetchClosing } = useQuery<DailyClosingRecord | null>({
    queryKey: ['dailyClosing', date],
    queryFn: () => getDailyClosing(date),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: recentResult } = useQuery({
    queryKey: ['recentClosings'],
    queryFn: getRecentClosings,
    staleTime: 120 * 1000,
    refetchOnWindowFocus: false,
  });

  const recentClosings = recentResult?.items || [];

  const summary = useMemo(() => {
    const completed = sales.filter((s) => s.status === 'completed');
    const cancelled = sales.filter((s) => s.status === 'cancelled');
    const pending = sales.filter((s) => s.status === 'pending');
    const payments = completed.reduce<Record<string, number>>((acc, s) => {
      const m = s.payment_method || 'digital';
      acc[m] = (acc[m] || 0) + Number(s.total_amount || 0);
      return acc;
    }, {});
    return {
      completed,
      cancelled,
      pending,
      payments,
      total: completed.reduce((sum, s) => sum + Number(s.total_amount || 0), 0),
      cash: payments.cash || 0,
    };
  }, [sales]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const latest = await getSalesForClosing(date);
      if (latest.some((s) => s.status === 'pending')) {
        throw new Error('မပြီးသေးသော အော်ဒါရှိနေပါသည်။ အရင်ငွေရှင်းပါ သို့မဟုတ် ပယ်ဖျက်ပါ။');
      }
      return saveDailyClosing({ date, sales: latest, countedCash, user });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyClosing', date] });
      queryClient.invalidateQueries({ queryKey: ['recentClosings'] });
      toast.success('နေ့စဉ်အရောင်းပိတ်စာရင်း သိမ်းပြီးပါပြီ');
      setCountedCash('');
    },
    onError: (err: Error) => toast.error('အရောင်းပိတ်စာရင်း သိမ်းမရပါ', { description: err.message }),
  });

  if (salesError || closingError) {
    return (
      <div className="space-y-5 pb-10">
        <ErrorState title="အရောင်းပိတ်စာရင်း ဒေတာရယူ၍မရပါ" message="ဆာဗာချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။" onRetry={() => { refetchSales(); refetchClosing(); }} />
      </div>
    );
  }

  if (salesLoading || closingLoading) return <LoadingState type="spinner" />;

  const numCounted = Number(countedCash || 0);
  const diff = numCounted - summary.cash;
  const isInputValid = countedCash.trim() !== '' && Number.isFinite(numCounted) && numCounted >= 0;
  const isBlocked = !isInputValid || summary.pending.length > 0 || saveMutation.isPending;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700"><ClipboardCheck size={22} /></span>
          <h1 className="text-xl font-black text-gray-900 sm:text-2xl">နေ့စဉ် အရောင်းပိတ်စာရင်း</h1>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-2xs">
          <CalendarDays size={16} className="text-gray-400" />
          <span>ရက်စွဲ</span>
          <Input type="date" value={date} max={localDateValue()} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setCountedCash(''); } }} className="h-8 w-auto border-0 p-1 text-sm shadow-none" />
        </label>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="ရောင်းပြီးအော်ဒါ" value={`${summary.completed.length} ခု`} />
        <StatCard title="ရောင်းအားစုစုပေါင်း" value={<Money value={summary.total} />} />
        <StatCard title="ငွေသားရောင်းအား" value={<Money value={summary.cash} />} tone="amber" />
        <StatCard title="ပယ်ဖျက်အော်ဒါ" value={`${summary.cancelled.length} ခု`} />
      </div>

      {/* Pending Warning */}
      {summary.pending.length > 0 && !closing && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 sm:text-sm">
          <b>သတိပေးချက်:</b> မပြီးသေးသော အော်ဒါ {summary.pending.length} ခု ရှိနေပါသည်။ စာရင်းမပိတ်မီ ငွေရှင်းပါ သို့မဟုတ် ပယ်ဖျက်ပါ။
        </div>
      )}

      {/* Payment Methods & Reconciliation */}
      <Card className="space-y-4 border-gray-100 p-4 sm:p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-gray-900">ငွေပေးချေမှုအလိုက် ရောင်းအား</h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {METHODS.map(([key, label]) => {
            const amount = summary.payments[key] || 0;
            return (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className={`mt-1 text-sm font-bold ${amount > 0 ? 'text-gray-900' : 'text-gray-400'}`}><Money value={amount} /></p>
              </div>
            );
          })}
        </div>

        {closing ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 font-bold text-emerald-800"><CheckCircle2 size={18} />ဒီနေ့စာရင်း ပိတ်ပြီးပါပြီ</div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3 sm:text-sm text-emerald-950">
              <p className="text-gray-600">မျှော်မှန်းငွေသား: <b className="text-emerald-900"><Money value={closing.expected_cash} /></b></p>
              <p className="text-gray-600">ရေတွက်ရရှိငွေ: <b className="text-emerald-900"><Money value={closing.counted_cash} /></b></p>
              <p className="text-gray-600">ကွာဟချက်: <b className={closing.cash_difference < 0 ? 'text-red-700' : 'text-emerald-900'}><Money value={closing.cash_difference} /></b></p>
            </div>
            <p className="mt-2 text-xs text-emerald-800">ပိတ်သိမ်းသူ: {closing.closed_by} · {formatTime(closing.created)}</p>
          </div>
        ) : (
          <div className="grid gap-3.5 border-t border-gray-100 pt-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="space-y-1.5 text-xs font-bold text-gray-700">အံဆွဲထဲမှ ရေတွက်ရရှိငွေသား
              <Input type="number" min="0" step="1" value={countedCash} onChange={(e) => setCountedCash(e.target.value)} placeholder="ဥပမာ - 250000" className="h-10 text-sm" />
            </label>
            <div className={`rounded-xl border p-2.5 text-xs ${countedCash === '' ? 'border-gray-200 bg-gray-50/80 text-gray-600' : diff < 0 ? 'border-red-200 bg-red-50 text-red-800' : diff > 0 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-500">ကွာဟချက်</span>
                <span className="font-semibold">{countedCash === '' ? 'ငွေသားထည့်ပါ' : diff < 0 ? 'ငွေလျော့နေသည်' : diff > 0 ? 'ငွေပိုနေသည်' : 'ကိုက်ညီပါသည်'}</span>
              </div>
              <p className="mt-1 text-base font-black"><Money value={countedCash === '' ? 0 : diff} /></p>
            </div>
            <Button disabled={isBlocked} isLoading={saveMutation.isPending} onClick={() => saveMutation.mutate()} className="h-10 px-5 font-bold">
              <ClipboardCheck size={16} className="mr-1.5" />စာရင်းပိတ်မည်
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Closings History Table */}
      <Card className="space-y-3.5 border-gray-100 p-4 sm:p-5 shadow-2xs">
        <h2 className="text-sm font-bold text-gray-900">နောက်ဆုံး ပိတ်သိမ်းထားသော မှတ်တမ်းများ</h2>
        {recentClosings.length === 0 ? (
          <EmptyState
            title="ပိတ်သိမ်းမှတ်တမ်း မရှိသေးပါ"
            description="အရောင်းပိတ်ထားသော ရက်များ ဤနေရာတွင် ပေါ်လာပါမည်"
            className="py-8 border-0 shadow-none"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70 text-xs">
                  <TableHead className="py-2.5 font-bold">ရက်စွဲ</TableHead>
                  <TableHead className="font-bold">အော်ဒါ</TableHead>
                  <TableHead className="font-bold">ရောင်းအားစုစုပေါင်း</TableHead>
                  <TableHead className="font-bold">မျှော်မှန်းငွေသား</TableHead>
                  <TableHead className="font-bold">ရေတွက်ငွေ</TableHead>
                  <TableHead className="font-bold">ကွာဟချက်</TableHead>
                  <TableHead className="font-bold">ပိတ်သိမ်းသူ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClosings.map((r) => (
                  <TableRow key={r.id} className="text-xs sm:text-sm">
                    <TableCell className="py-3 font-medium text-gray-900">{formatDate(r.business_date)}</TableCell>
                    <TableCell className="text-gray-600">{r.sales_count} ခု</TableCell>
                    <TableCell className="font-semibold text-gray-900"><Money value={r.total_sales} /></TableCell>
                    <TableCell className="text-gray-700"><Money value={r.expected_cash} /></TableCell>
                    <TableCell className="text-gray-700"><Money value={r.counted_cash} /></TableCell>
                    <TableCell className={r.cash_difference < 0 ? 'font-bold text-red-600' : r.cash_difference > 0 ? 'font-bold text-amber-600' : 'font-medium text-emerald-600'}>
                      <Money value={r.cash_difference} />
                    </TableCell>
                    <TableCell className="text-gray-500">{r.closed_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
