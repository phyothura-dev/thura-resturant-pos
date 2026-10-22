import { useState, useMemo } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Banknote, QrCode, Smartphone, CreditCard, Sparkles, ArrowRight } from 'lucide-react';
import { APP_CONFIG } from '@/config/constants';
import { paymentSchema } from '../schemas';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'ငွေသား', icon: Banknote, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'kpay', label: 'KBZPay', icon: Smartphone, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'wavepay', label: 'WavePay', icon: QrCode, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'banking', label: 'Banking', icon: CreditCard, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

function PaymentModalContent({
  onClose,
  subtotal = 0,
  tax = 0,
  serviceCharge = 0,
  total = 0,
  onConfirmPayment,
  isProcessing = false,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscount, setCustomDiscount] = useState('');
  const [receivedAmount, setReceivedAmount] = useState(String(total));

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (customDiscount && !isNaN(Number(customDiscount))) {
      return Math.min(total, Math.max(0, Number(customDiscount)));
    }
    if (discountPercent > 0) {
      return Math.round((total * discountPercent) / 100);
    }
    return 0;
  }, [total, discountPercent, customDiscount]);

  // Final total after discount
  const finalTotal = Math.max(0, total - discountAmount);

  const handleDiscountPercent = (pct: number) => {
    setDiscountPercent(pct);
    setCustomDiscount('');
    const disc = Math.round((total * pct) / 100);
    setReceivedAmount(String(Math.max(0, total - disc)));
  };

  const handleCustomDiscount = (val: string) => {
    setCustomDiscount(val);
    setDiscountPercent(0);
    const disc = Math.min(total, Math.max(0, Number(val) || 0));
    setReceivedAmount(String(Math.max(0, total - disc)));
  };

  const receivedNum = Number(receivedAmount) || 0;
  const changeAmount = Math.max(0, receivedNum - finalTotal);
  const isShort = paymentMethod === 'cash' && receivedNum < finalTotal;

  const handleAddCash = (amount: number) => {
    setReceivedAmount((prev) => String((Number(prev) || 0) + amount));
  };

  const handleSetExact = () => {
    setReceivedAmount(String(finalTotal));
  };

  const handleConfirm = () => {
    if (isShort) return;
    const payload = {
      paymentMethod,
      discountAmount,
      receivedAmount: paymentMethod === 'cash' ? receivedNum : finalTotal,
      changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
      finalTotal,
      serviceCharge: serviceCharge > 0 ? serviceCharge : undefined,
      tax: tax > 0 ? tax : undefined,
    };
    const parsed = paymentSchema.safeParse(payload);
    if (!parsed.success) return;
    onConfirmPayment(parsed.data);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="ငွေရှင်းမည်">
      <div className="space-y-4">
        {/* Total Summary Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 shadow-md">
          <div className="flex justify-between items-center text-xs opacity-90 mb-1">
            <span>ကျသင့်ငွေ (ကုန်ကျငွေ)</span>
            <span>{subtotal.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
          </div>

          {serviceCharge > 0 && (
            <div className="flex justify-between items-center text-xs opacity-90 mb-1">
              <span>ဝန်ဆောင်ခ ({APP_CONFIG.SERVICE_CHARGE_RATE * 100}%)</span>
              <span>+ {serviceCharge.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between items-center text-xs opacity-90 mb-1">
              <span>အခွန် ({APP_CONFIG.TAX_RATE * 100}%)</span>
              <span>+ {tax.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-xs text-amber-200 mb-1">
              <span>လျှော့စျေး</span>
              <span>- {discountAmount.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-1 border-t border-white/20">
            <span className="text-sm font-semibold opacity-95">ပေးချေရမည့်ငွေ</span>
            <span className="text-2xl font-black tracking-tight">
              {finalTotal.toLocaleString()} <span className="text-sm font-normal">{APP_CONFIG.CURRENCY}</span>
            </span>
          </div>
        </div>

        {/* Discount Selector */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>လျှော့စျေး (Discount)</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handleDiscountPercent(pct)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  discountPercent === pct && !customDiscount
                    ? 'bg-primary text-white border-primary shadow-2xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {pct === 0 ? 'မရှိ' : `${pct}%`}
              </button>
            ))}
            <div className="relative w-28">
              <Input
                type="number"
                min="0"
                placeholder="ကျပ်"
                value={customDiscount}
                onChange={(e) => handleCustomDiscount(e.target.value)}
                className="h-8.5 rounded-xl text-xs pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">
                ကျပ်
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 block">
            ငွေပေးချေမှုပုံစံ
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? `${m.color} ring-2 ring-primary/20 shadow-2xs font-bold`
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Calculation (Only if Cash is selected) */}
        {paymentMethod === 'cash' ? (
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/60 p-3.5 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                ဧည့်သည် ပေးငွေ (လက်ခံရရှိငွေ)
              </label>
              <Input
                type="number"
                min="0"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="0"
                className="h-11 rounded-xl text-lg font-bold bg-white text-gray-900 border-gray-300"
              />
            </div>

            {/* Quick Denomination Buttons */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleSetExact}
                className="rounded-lg text-[11px] font-bold h-7 bg-white"
              >
                အတိအကျ
              </Button>
              {[1000, 5000, 10000, 20000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddCash(amt)}
                  className="px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 text-[11px] font-bold transition-all cursor-pointer"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Change Display */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                isShort
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span className="text-xs font-bold">
                {isShort ? 'ပေးငွေ မပြည့်သေးပါ' : 'ပြန်အမ်းငွေ'}
              </span>
              <div className="text-right">
                <span className="text-lg font-black">
                  {isShort
                    ? (finalTotal - receivedNum).toLocaleString()
                    : changeAmount.toLocaleString()}
                </span>
                <span className="text-xs ml-1 font-semibold">{APP_CONFIG.CURRENCY}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-center text-xs text-blue-700 flex items-center justify-center gap-2">
            <QrCode className="h-4 w-4" />
            <span>
              {paymentMethod === 'kpay'
                ? 'KBZPay'
                : paymentMethod === 'wavepay'
                  ? 'WavePay'
                  : 'Banking'}{' '}
              ဖြင့် ငွေလွှဲလက်ခံပြီးပါက အတည်ပြုပါ
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 rounded-xl h-11 text-xs font-bold"
          >
            မလုပ်တော့ပါ
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || isShort}
            isLoading={isProcessing}
            className="flex-1 rounded-xl h-11 text-xs font-bold bg-primary hover:bg-primary/90 shadow-sm"
          >
            <span>ငွေရှင်းမည်</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function PaymentModal({ isOpen, onClose, ...props }: any) {
  if (!isOpen) return null;
  return <PaymentModalContent onClose={onClose} {...props} />;
}
