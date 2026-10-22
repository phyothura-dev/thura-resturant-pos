import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/apiProducts';
import { getCategories } from '../services/apiCategories';
import { getTables } from '../services/apiTables';
import {
  getPendingSaleByTable,
  getPendingSaleById,
  createPendingSale,
  updatePendingSale,
  completeSale,
  moveTable,
  mergeTables,
  cancelPendingSale,
} from '../services/apiSales';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CustomSelect } from '../components/ui/CustomSelect';
import { Search, ArrowLeft, X, UtensilsCrossed, ArrowRightLeft, ShoppingBag, Filter, Printer } from 'lucide-react';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import ProductCard from '@/components/ProductCard';
import CartPanel from '../components/CartPanel';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import MoveTableModal from '../components/MoveTableModal';
import { toast } from 'sonner';
import { Modal } from '../components/ui/Modal';
import { cancellationSchema } from '../schemas';

export default function POS() {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const saleIdParam = searchParams.get('saleId');
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isTakeaway = tableId === 'takeaway';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [moveTableModalOpen, setMoveTableModalOpen] = useState(false);
  const [completedSaleData, setCompletedSaleData] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: getTables,
  });

  const currentTable = useMemo(
    () => (!isTakeaway ? tables.find((t) => t.id === tableId) : null),
    [tables, tableId, isTakeaway]
  );

  const availableTables = useMemo(
    () => tables.filter((t) => !t.is_occupied && t.id !== tableId),
    [tables, tableId]
  );

  const occupiedTables = useMemo(
    () => tables.filter((t) => t.is_occupied && t.id !== tableId),
    [tables, tableId]
  );

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: products = [], isLoading: productsLoading, isError: productsError, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: pendingSale, isLoading: pendingLoading } = useQuery({
    queryKey: ['pendingSale', tableId, saleIdParam],
    queryFn: () => {
      if (saleIdParam) return getPendingSaleById(saleIdParam);
      if (!isTakeaway && tableId) return getPendingSaleByTable(tableId);
      return null;
    },
    enabled: Boolean(saleIdParam || (!isTakeaway && tableId)),
  });

  const {
    cart,
    pendingSaleId,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateNotes,
    clearCart,
    subtotal,
    tax,
    serviceCharge,
    total,
    taxRate,
    serviceChargeRate,
  } = useCart(pendingSale, isTakeaway ? (saleIdParam ? `takeaway_${saleIdParam}` : 'takeaway_new') : tableId);

  // Cart quantity map for each product to show on product cards
  const cartQuantityMap = useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      const pid = item.product_id || item.id;
      if (pid) {
        map[pid] = (map[pid] || 0) + item.quantity;
      }
    });
    return map;
  }, [cart]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pendingSale'] });
    queryClient.invalidateQueries({ queryKey: ['tables'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    queryClient.invalidateQueries({ queryKey: ['takeawaySales'] });
    queryClient.invalidateQueries({ queryKey: ['kitchenOrders'] });
  };

  // Save Order Mutation (Pending)
  const { mutate: saveSale, isPending: isSaving } = useMutation({
    mutationFn: () =>
      pendingSaleId
        ? updatePendingSale({ saleId: pendingSaleId, items: cart, totalAmount: total, sendToKitchen: true })
        : createPendingSale({
            tableId: isTakeaway ? null : tableId,
            orderType: isTakeaway ? 'takeaway' : 'dine_in',
            items: cart,
            totalAmount: total,
            sendToKitchen: true,
          }),
    onSuccess: () => {
      invalidateAll();
      toast.success('သိမ်းပြီးပါပြီ');
      navigate('/tables');
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  // Complete & Checkout Mutation
  const { mutate: checkout, isPending: isCheckingOut } = useMutation({
    mutationFn: async ({ paymentMethod, discountAmount, receivedAmount, changeAmount, finalTotal }) => {
      let saleId = pendingSaleId;
      if (!saleId) {
        const created = await createPendingSale({
          tableId: isTakeaway ? null : tableId,
          orderType: isTakeaway ? 'takeaway' : 'dine_in',
          items: cart,
          totalAmount: finalTotal,
        });
        saleId = created.id;
      } else {
        await updatePendingSale({ saleId, items: cart, totalAmount: finalTotal });
      }

      return completeSale({
        saleId,
        tableId: isTakeaway ? null : tableId,
        totalAmount: finalTotal,
        paymentMethod,
        discountAmount,
        receivedAmount,
        changeAmount,
      });
    },
    onSuccess: (data, variables) => {
      setCompletedSaleData({
        ...data,
        items: cart,
        discount_amount: variables.discountAmount,
        received_amount: variables.receivedAmount,
        change_amount: variables.changeAmount,
        payment_method: variables.paymentMethod,
        tax: variables.tax,
        serviceCharge: variables.serviceCharge,
      });
      setPaymentModalOpen(false);
      setInvoiceModalOpen(true);
      clearCart();
      invalidateAll();
      toast.success('ငွေရှင်းပြီးပါပြီ');
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  // Move Table Mutation
  const { mutate: handleMoveTable, isPending: isMovingTable } = useMutation({
    mutationFn: (toTableId: string) =>
      moveTable({
        fromTableId: tableId,
        toTableId,
        saleId: pendingSaleId,
      }),
    onSuccess: (_, toTableId) => {
      invalidateAll();
      toast.success('စားပွဲ ပြောင်းပြီးပါပြီ');
      setMoveTableModalOpen(false);
      navigate(`/pos/${toTableId}`);
    },
    onError: (err) => toast.error('မအောင်မြင်ပါ', { description: err.message }),
  });

  // Merge Table Mutation
  const { mutate: handleMergeTable, isPending: isMergingTable } = useMutation({
    mutationFn: async (targetTableId: string) => {
      const targetSale = await getPendingSaleByTable(targetTableId);
      if (!targetSale) throw new Error('ပေါင်းစည်းမည့် စားပွဲတွင် အော်ဒါမရှိသေးပါ');
      return mergeTables({
        fromTableId: isTakeaway ? null : tableId,
        toTableId: targetTableId,
        fromSaleId: pendingSaleId,
        toSaleId: targetSale.id,
      });
    },
    onSuccess: (_, targetTableId) => {
      invalidateAll();
      toast.success('စားပွဲ ပေါင်းစည်းပြီးပါပြီ');
      setMoveTableModalOpen(false);
      navigate(`/pos/${targetTableId}`);
    },
    onError: (err) => toast.error('စားပွဲပေါင်းစည်း၍ မရပါ', { description: err.message }),
  });

  const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
    mutationFn: () => {
      const parsed = cancellationSchema.safeParse({ reason: cancelReason });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'ပယ်ဖျက်ရသည့်အကြောင်းရင်း ထည့်ပါ');
      return cancelPendingSale({
        saleId: pendingSaleId,
        tableId: isTakeaway ? null : tableId,
        reason: parsed.data.reason,
        cancelledBy: user?.name || user?.email,
      });
    },
    onSuccess: () => {
      clearCart();
      invalidateAll();
      setCancelModalOpen(false);
      toast.success('အော်ဒါကို ပယ်ဖျက်ပြီး မှတ်တမ်းတင်လိုက်ပါပြီ');
      navigate('/tables');
    },
    onError: (err) => toast.error('အော်ဒါပယ်ဖျက်၍ မရပါ', { description: err.message }),
  });

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: `အားလုံး (${products.length})` },
      ...categories.map((cat) => {
        const count = products.filter(
          (p) => (p.category_id || p.categories?.id) === cat.id
        ).length;
        return {
          value: cat.id,
          label: `${cat.name} (${count})`,
        };
      }),
    ];
  }, [categories, products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.categories?.name?.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === 'all' ||
        (p.category_id || p.categories?.id) === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSave = () => {
    if (cart.length === 0) return toast.error('ခြင်းထဲတွင် ပစ္စည်းထည့်ပါ');
    saveSale();
  };

  const handleOpenPayment = () => {
    if (!user) return toast.error('ကျေးဇူးပြု၍ အရင်ဆုံး အကောင့်ဝင်ပါ');
    if (cart.length === 0) return toast.error('ခြင်းထဲတွင် ပစ္စည်းထည့်ပါ');
    setPaymentModalOpen(true);
  };

  const handleInvoiceClose = () => {
    setInvoiceModalOpen(false);
    navigate('/tables');
  };

  if (productsError) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <ErrorState
          title="မီနူးပစ္စည်းများ ရယူ၍မရပါ"
          message="ဆာဗာချိတ်ဆက်မှုကို စစ်ဆေးပြီး ပြန်လည်ကြိုးစားပါ။"
          onRetry={refetchProducts}
        />
      </div>
    );
  }

  if (productsLoading || pendingLoading) {
    return <LoadingState type="spinner" />;
  }

  const tableLabel = isTakeaway
    ? 'ပါဆယ် (Takeaway)'
    : currentTable?.table_number
      ? `စားပွဲ - ${currentTable.table_number}`
      : `စားပွဲ - ${tableId}`;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full lg:h-[calc(100vh-8rem)]">
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs min-h-[500px] lg:min-h-0 transition-all duration-300">
        {/* Header Search & Category Filter Toolbar */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/tables')}
              className="shrink-0 rounded-xl h-10 px-3 border-gray-200"
              title="စားပွဲဝိုင်းများသို့ ပြန်သွားမည်"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 min-w-[140px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="မီနူး ရှာရန်..."
                className="pl-9 pr-8 h-10 bg-white border-gray-200 rounded-xl focus:border-primary text-xs sm:text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category CustomSelect Dropdown */}
            <div className="w-38 sm:w-48 shrink-0">
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                icon={<Filter className="h-3.5 w-3.5" />}
                placeholder="အမျိုးအစား: အားလုံး"
                options={categoryOptions}
              />
            </div>

            {/* Table / Takeaway Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 ${
                isTakeaway
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isTakeaway ? <ShoppingBag className="h-3.5 w-3.5" /> : <UtensilsCrossed className="h-3.5 w-3.5" />}
              <span>{tableLabel}</span>
            </div>

            {/* Move Table Button (Only for Dine-in with active pending order) */}
            {!isTakeaway && pendingSaleId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMoveTableModalOpen(true)}
                className="hidden sm:flex items-center gap-1 rounded-xl h-10 px-2.5 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-100"
                title="စားပွဲ ပြောင်းမည်"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>ပြောင်းမည်</span>
              </Button>
            )}

            {/* Print Pre-bill / Invoice Preview Button */}
            {cart.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setCompletedSaleData({
                    id: pendingSaleId || 'PRE-BILL',
                    table: currentTable?.table_number || tableId,
                    order_type: isTakeaway ? 'takeaway' : 'dine_in',
                    items: cart,
                    payment_method: 'cash',
                    subtotal: subtotal,
                    tax: tax,
                    serviceCharge: serviceCharge,
                    total_amount: total,
                    expand: { table: currentTable },
                  });
                  setInvoiceModalOpen(true);
                }}
                className="flex items-center gap-1 rounded-xl h-10 px-2.5 text-xs font-bold border-gray-200 text-gray-700 hover:bg-gray-100"
                title="ပြေစာ ကြည့်ရှု / ထုတ်မည်"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ပြေစာစစ်မည်</span>
              </Button>
            )}
          </div>
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                cartQuantity={cartQuantityMap[product.id] || 0}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <EmptyState
              icon={UtensilsCrossed}
              title="ရှာမတွေ့ပါ"
              description="အခြား စကားလုံး သို့မဟုတ် အမျိုးအစား စစ်ဆေးပါ"
              className="py-14 border-0 shadow-none"
            />
          )}
        </div>
      </div>

      {/* Cart Summary Panel */}
      <CartPanel
        cart={cart}
        pendingSaleId={pendingSaleId}
        subtotal={subtotal}
        tax={tax}
        serviceCharge={serviceCharge}
        taxRate={taxRate}
        serviceChargeRate={serviceChargeRate}
        total={total}
        isSaving={isSaving}
        isCheckingOut={isCheckingOut}
        onUpdateQuantity={updateQuantity}
        onUpdateNotes={updateNotes}
        onRemove={removeFromCart}
        onClear={clearCart}
        onSave={handleSave}
        onCheckout={handleOpenPayment}
        orderType={isTakeaway ? 'takeaway' : 'dine_in'}
        onCancelOrder={() => { setCancelReason(''); setCancelModalOpen(true); }}
        isCancelling={isCancelling}
      />

      <Modal isOpen={cancelModalOpen} onClose={() => !isCancelling && setCancelModalOpen(false)} title="အော်ဒါပယ်ဖျက်မည်">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">ဒီအော်ဒါကို ဖျက်ပစ်မယ့်အစား ပယ်ဖျက်မှတ်တမ်းအဖြစ် သိမ်းထားပါမယ်။ ပယ်ဖျက်ရတဲ့အကြောင်းရင်းကို ထည့်ပါ။</p>
          <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} rows={3} maxLength={500} placeholder="ဥပမာ - ဧည့်သည် မှာယူမှုကို ပြန်ရုပ်သိမ်းသည်" className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>မလုပ်တော့ပါ</Button>
            <Button variant="destructive" onClick={() => cancelOrder()} disabled={!cancelReason.trim() || isCancelling} isLoading={isCancelling}>ပယ်ဖျက်မှတ်တမ်းတင်မည်</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Modal (Myanmar Payments & Change Calculator) */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        subtotal={subtotal}
        tax={tax}
        serviceCharge={serviceCharge}
        total={total}
        onConfirmPayment={checkout}
        isProcessing={isCheckingOut}
      />

      {/* Printable Receipt & Kitchen Slip Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={handleInvoiceClose}
        sale={completedSaleData}
      />

      {/* Move & Merge Table Modal */}
      <MoveTableModal
        isOpen={moveTableModalOpen}
        onClose={() => setMoveTableModalOpen(false)}
        currentTableNumber={currentTable?.table_number || tableId}
        availableTables={availableTables}
        occupiedTables={occupiedTables}
        onConfirmMove={handleMoveTable}
        onConfirmMerge={handleMergeTable}
        isLoading={isMovingTable || isMergingTable}
      />
    </div>
  );
}
