import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getTables } from '../services/apiTables';
import { getPendingTakeawaySales } from '../services/apiSales';
import { pb } from '../services/pocketbase';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Button } from '../components/ui/Button';
import { UtensilsCrossed, ShoppingBag, Plus } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';

function TableCard({ table, onSelect }) {
  const occupied = table.is_occupied;
  const displayNumber = table.table_number || table.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(table.id)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left bg-white ${
        occupied
          ? 'border-red-200/80 hover:border-red-400 hover:shadow-md'
          : 'border-gray-200/80 hover:border-emerald-400 hover:shadow-md'
      } active:scale-[0.98]`}
    >
      {/* Top Header Row: Table Label & Status Badge */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-medium text-gray-400">စားပွဲဝိုင်း</span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
            occupied
              ? 'bg-red-50 text-red-700 border border-red-200/60'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              occupied ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          {occupied ? 'လူရှိ' : 'အားလပ်'}
        </span>
      </div>

      {/* Main Table Number */}
      <div className="py-2">
        <span className="text-3xl font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight">
          {displayNumber}
        </span>
      </div>

      {/* Bottom Action Hint */}
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <span>{occupied ? 'အော်ဒါကြည့်မည်' : 'အော်ဒါဖွင့်မည်'}</span>
        <span
          className={`text-xs font-bold transition-transform group-hover:translate-x-0.5 ${
            occupied ? 'text-red-500' : 'text-emerald-600'
          }`}
        >
          →
        </span>
      </div>
    </button>
  );
}

export default function Tables() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tables = [], isLoading: tablesLoading, isError: tablesError, refetch: refetchTables } = useQuery({
    queryKey: ['tables'],
    queryFn: getTables,
  });

  const { data: takeawaySales = [] } = useQuery({
    queryKey: ['takeawaySales'],
    queryFn: getPendingTakeawaySales,
  });

  // Realtime subscription for tables and sales
  useEffect(() => {
    let unsubTables = () => {};
    let unsubSales = () => {};

    pb.collection('tables')
      .subscribe('*', () => {
        queryClient.invalidateQueries({ queryKey: ['tables'] });
      })
      .then((unsub) => {
        unsubTables = unsub;
      })
      .catch(() => {});

    pb.collection('sales')
      .subscribe('*', () => {
        queryClient.invalidateQueries({ queryKey: ['takeawaySales'] });
      })
      .then((unsub) => {
        unsubSales = unsub;
      })
      .catch(() => {});

    return () => {
      unsubTables();
      unsubSales();
      pb.collection('tables').unsubscribe('*').catch(() => {});
      pb.collection('sales').unsubscribe('*').catch(() => {});
    };
  }, [queryClient]);

  const { occupiedCount, availableCount } = useMemo(() => {
    let occupied = 0;
    let available = 0;
    for (const t of tables) {
      t.is_occupied ? occupied++ : available++;
    }
    return { occupiedCount: occupied, availableCount: available };
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (statusFilter === 'available') return tables.filter((t) => !t.is_occupied);
    if (statusFilter === 'occupied') return tables.filter((t) => t.is_occupied);
    return tables;
  }, [tables, statusFilter]);

  const handleSelectTable = (tableId) => navigate(`/pos/${tableId}`);
  const handleNewTakeaway = () => navigate('/pos/takeaway');
  const handleSelectTakeaway = (saleId) => navigate(`/pos/takeaway?saleId=${saleId}`);

  return (
    <div className="space-y-4">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 shadow-xs">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">စားပွဲဝိုင်းများ</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {tables.length}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter CustomSelect */}
          <div className="w-36 sm:w-40">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: `အားလုံး (${tables.length})` },
                { value: 'available', label: `အားလပ် (${availableCount})` },
                { value: 'occupied', label: `လူရှိ (${occupiedCount})` },
              ]}
            />
          </div>

          {/* New Takeaway Button */}
          <Button
            onClick={handleNewTakeaway}
            className="rounded-xl shadow-xs gap-1.5 h-10 px-3.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>ပါဆယ်အသစ်</span>
          </Button>
        </div>
      </div>

      {/* Active Pending Takeaway Queue (if any) */}
      {takeawaySales.length > 0 && (
        <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-amber-600" />
              <span>လက်ရှိ ပါဆယ်အော်ဒါများ ({takeawaySales.length})</span>
            </div>
            <span className="text-[11px] font-normal text-amber-700">ငွေရှင်းရန် နှိပ်ပါ</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {takeawaySales.map((sale) => (
              <button
                key={sale.id}
                onClick={() => handleSelectTakeaway(sale.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-amber-200 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all text-left shrink-0 min-w-[170px]"
              >
                <div className="h-9 w-9 rounded-lg bg-amber-100/80 text-amber-800 flex items-center justify-center font-black text-xs">
                  #{sale.id.slice(0, 4)}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {sale.total_amount?.toLocaleString()} {APP_CONFIG.CURRENCY}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(sale.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Tables Grid */}
      {tablesError ? (
        <ErrorState
          title="စားပွဲဝိုင်းများ ရယူ၍မရပါ"
          message="ဆာဗာချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။"
          onRetry={refetchTables}
        />
      ) : tablesLoading ? (
        <LoadingState type="card" rows={3} />
      ) : filteredTables.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="စားပွဲဝိုင်း မရှိသေးပါ" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredTables.map((table) => (
            <TableCard key={table.id} table={table} onSelect={handleSelectTable} />
          ))}
        </div>
      )}
    </div>
  );
}
