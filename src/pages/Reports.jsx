import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pb } from '../services/pocketbase';
import { Card } from '../components/ui/Card';
import { Loader2, DollarSign, ShoppingCart, TrendingUp, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { formatDate, formatTime } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';

export default function Reports() {
  const { data: sales = [], isLoading: loading } = useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const records = await pb.collection('sales').getFullList({
        sort: '-created',
        expand: 'sale_items_via_sale.product',
      });

      return records.map((s) => ({
        ...s,
        created_at: s.created,
        sale_items: (s.expand?.sale_items_via_sale || []).map((si) => ({
          quantity: si.quantity,
          products: si.expand?.product
            ? {
                name: si.expand.product.name,
                price: si.expand.product.price,
              }
            : null,
        })),
      }));
    },
  });

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter((s) => s.created_at && s.created_at.startsWith(today));

    const dailyTotal = todaysSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
    const orderCount = todaysSales.length;
    const avgSale = orderCount > 0 ? dailyTotal / orderCount : 0;

    return {
      dailyTotal,
      orderCount,
      avgSale,
    };
  }, [sales]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      })
      .reverse();

    return last7Days.map((date) => {
      const daySales = sales.filter((s) => s.created_at && s.created_at.startsWith(date));
      const total = daySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        date: date,
        amount: total,
      };
    });
  }, [sales]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">အစီရင်ခံစာ</h1>
        <p className="text-sm text-gray-500 mt-1">ရောင်းအားနှင့် စွမ်းဆောင်ရည် ခြုံငုံသုံးသပ်ချက်</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <StatCard title="ယနေ့ရောင်းအား" value={`${stats.dailyTotal.toLocaleString()} ကျပ်`} icon={<DollarSign className="h-5 w-5" />} />
        <StatCard title="အော်ဒါအရေအတွက်" value={`${stats.orderCount} ခု`} icon={<ShoppingCart className="h-5 w-5" />} />
        <StatCard title="ပျမ်းမျှ ငွေပမာဏ" value={`${Math.round(stats.avgSale).toLocaleString()} ကျပ်`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <Card className="p-6 border-gray-100 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900">နေ့စဉ် ရောင်းအား</h2>
          <p className="text-xs text-gray-500">လွန်ခဲ့သော ၇ ရက်အတွင်း</p>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e2e2ff" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value) => [`${value.toLocaleString()} ကျပ်`, 'ရောင်းအား']} />
              <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} dot={{ r: 5, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <FileText className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">လတ်တလော အရောင်းစာရင်းများ</h2>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="font-bold">နေ့ရက်</TableHead>
                <TableHead className="font-bold">အချိန်</TableHead>
                <TableHead className="font-bold">ဘောင်ချာနံပါတ်</TableHead>
                <TableHead className="font-bold">ငွေချေမှု</TableHead>
                <TableHead className="font-bold">ပစ္စည်းများ</TableHead>
                <TableHead className="text-right font-bold">ကျသင့်ငွေ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50/30">
                  <TableCell className="font-medium text-gray-900 py-4">{formatDate(sale.created_at)}</TableCell>
                  <TableCell className="text-gray-500 py-4">{formatTime(sale.created_at)}</TableCell>
                  <TableCell className="text-gray-500 py-4">#{sale.id.toString().slice(-6)}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant={sale.payment_method === 'cash' ? 'default' : 'warning'}>{sale.payment_method === 'cash' ? 'ငွေသား' : 'ဒစ်ဂျစ်တယ်'}</Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {sale.sale_items?.map((item, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.products?.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900 py-4">{(sale.total_amount || 0).toLocaleString()} ကျပ်</TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                    အရောင်းစာရင်းမရှိသေးပါ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <Card className="p-4 border-gray-100 shadow-sm hover:ring-1 hover:ring-primary/50 transition-all">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className="p-2 bg-primary/10 rounded-lg text-primary/90">{icon}</div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-[11px] font-medium text-primary flex items-center gap-1">{trend}</p>
      </div>
    </Card>
  );
}
