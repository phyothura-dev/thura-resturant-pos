import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock3, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getKitchenOrders, updateKitchenOrderStatus } from '../services/apiSales';
import { pb } from '../services/pocketbase';
import { Button } from '../components/ui/Button';
import { APP_CONFIG } from '../config/constants';

const statusLabels = { sent: 'အသစ်', preparing: 'ချက်ပြုတ်နေသည်', ready: 'အသင့်ဖြစ်ပြီ' };
const nextStatus = { sent: 'preparing', preparing: 'ready', ready: 'served' };
const nextLabel = { sent: 'ချက်ပြုတ်စမည်', preparing: 'အသင့်ဖြစ်ပြီ', ready: 'ပို့ပြီးပါပြီ' };

function elapsedTime(created) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(created).getTime()) / 60000));
  return minutes < 1 ? 'ယခုလေးတင်' : `${minutes} မိနစ်`;
}

function KitchenOrder({ order, onAdvance, isUpdating }) {
  const status = order.kitchen_status;
  return (
    <article className={`rounded-2xl border bg-white p-5 shadow-sm ${status === 'sent' ? 'border-amber-300' : status === 'ready' ? 'border-emerald-300' : 'border-blue-200'}`}>
      <header className="mb-4 flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {order.expand?.table?.table_number ? `စားပွဲ ${order.expand.table.table_number}` : 'ပါဆယ်'}
          </h2>
          <p className="mt-1 text-xs text-gray-500">အော်ဒါ #{order.id.slice(0, 6)}</p>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === 'sent' ? 'bg-amber-100 text-amber-800' : status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
            {statusLabels[status]}
          </span>
          <p className="mt-2 flex items-center justify-end gap-1 text-xs text-gray-500"><Clock3 size={13} />{elapsedTime(order.kitchen_sent_at || order.created)}</p>
        </div>
      </header>
      <ul className="mb-5 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex gap-3 border-b border-dashed border-gray-100 pb-3 last:border-0">
            <span className="min-w-9 rounded-lg bg-gray-100 px-2 py-1 text-center font-black text-gray-800">{item.quantity}×</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900">{item.name}</p>
              {item.notes && <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-sm font-medium text-amber-900">မှတ်ချက်: {item.notes}</p>}
            </div>
          </li>
        ))}
        {order.items.length === 0 && <li className="text-sm text-gray-500">ပစ္စည်းစာရင်း မရှိပါ</li>}
      </ul>
      <Button className="w-full" disabled={isUpdating} onClick={() => onAdvance(order.id, nextStatus[status])}>
        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{nextLabel[status]}
      </Button>
    </article>
  );
}

export default function Kitchen() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, isError, refetch } = useQuery({ queryKey: ['kitchenOrders'], queryFn: getKitchenOrders, refetchInterval: 30000 });
  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateKitchenOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] }),
    onError: (error) => toast.error('အော်ဒါအခြေအနေ မပြောင်းနိုင်ပါ', { description: error.message }),
  });

  useEffect(() => {
    let unsubscribe = () => {};
    pb.collection('sales').subscribe('*', () => queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] }))
      .then((stop) => { unsubscribe = stop; })
      .catch(() => {});
    return () => { unsubscribe(); pb.collection('sales').unsubscribe('*').catch(() => {}); };
  }, [queryClient]);

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-orange-100 p-3 text-orange-700"><ChefHat size={24} /></span>
          <div><h1 className="text-2xl font-black text-gray-900">မီးဖိုချောင်အော်ဒါများ</h1><p className="text-sm text-gray-500">KOT · လုပ်ဆောင်ဆဲ အော်ဒါ {orders.length} ခု</p></div>
        </div>
        <Button variant="outline" onClick={() => refetch()}><RefreshCw size={15} className="mr-2" />အသစ်ပြန်ယူမည်</Button>
      </header>
      {isLoading ? <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : null}
      {isError && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">အော်ဒါများကို ဖတ်မရပါ။ PocketBase ချိတ်ဆက်မှုနှင့် ခွင့်ပြုချက်ကို စစ်ပြီး ပြန်ကြိုးစားပါ။</div>}
      {!isLoading && !isError && orders.length === 0 && <div className="rounded-2xl border border-dashed bg-white py-20 text-center"><ChefHat className="mx-auto mb-3 text-gray-300" size={42} /><p className="font-semibold text-gray-600">မီးဖိုချောင်အော်ဒါ မရှိသေးပါ</p></div>}
      {orders.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{orders.map((order) => <KitchenOrder key={order.id} order={order} isUpdating={mutation.isPending && mutation.variables?.id === order.id} onAdvance={(id, status) => mutation.mutate({ id, status })} />)}</div>}
      <p className="text-xs text-gray-400">အော်ဒါပမာဏ: {orders.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0), 0)} ခု · ငွေကြေး {APP_CONFIG.CURRENCY}</p>
    </div>
  );
}
