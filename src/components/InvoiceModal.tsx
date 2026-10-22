import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import {
  Printer,
  CheckCircle2,
  Calendar,
  ChefHat,
  Receipt,
  FileText,
} from 'lucide-react';
import { APP_CONFIG } from '../config/constants';
import { getAppSettings } from '../utils/settings';

export default function InvoiceModal({ isOpen, onClose, sale }: any) {
  const settings = getAppSettings();
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm'>(() => settings.defaultPaperSize || '80mm');
  const [printType, setPrintType] = useState<'bill' | 'kot'>('bill');

  if (!sale) return null;

  const isTakeaway = sale?.order_type === 'takeaway' || !sale?.table;
  const tableLabel = isTakeaway
    ? 'ပါဆယ် (Takeaway)'
    : sale?.expand?.table?.table_number
      ? `စားပွဲ - ${sale.expand.table.table_number}`
      : `စားပွဲ - ${sale?.table || 'Dine-in'}`;

  const paymentLabel =
    sale?.payment_method === 'kpay'
      ? 'KBZPay'
      : sale?.payment_method === 'wavepay'
        ? 'WavePay'
        : sale?.payment_method === 'banking'
          ? 'Banking'
          : 'ငွေသား';

  const isPreBill = sale?.id === 'PRE-BILL';

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ငွေရှင်းပြေစာနှင့် KOT">
      <div className="space-y-4">
        {/* Status header */}
        <div className="flex flex-col items-center justify-center text-center py-1">
          <div
            className={`p-2.5 rounded-full ring-4 mb-1.5 ${
              isPreBill
                ? 'bg-blue-100 text-blue-600 ring-blue-50'
                : 'bg-emerald-100 text-emerald-600 ring-emerald-50'
            }`}
          >
            {isPreBill ? <FileText className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {isPreBill ? 'ပြေစာ / ဘေလ် စစ်ဆေးမည်' : 'ငွေရှင်းခြင်း အောင်မြင်ပါသည်'}
          </h3>
          <p className="text-xs text-gray-500 font-mono">
            {isPreBill ? 'စစ်ဆေးရန် ပြေစာ' : `ဘောင်ချာ: #${sale.id.slice(0, 8)}`}
          </p>
        </div>

        {/* Mode Switchers: Bill vs KOT & Paper Width */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPrintType('bill')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printType === 'bill'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Receipt size={14} />
              <span>ဧည့်သည် ပြေစာ</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintType('kot')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                printType === 'kot'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ChefHat size={14} />
              <span>မီးဖိုချောင် KOT</span>
            </button>
          </div>

          {/* Paper Width: 80mm vs 58mm */}
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                paperSize === '80mm'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              80mm
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
                paperSize === '58mm'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              58mm
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div
          className={`bg-white rounded-2xl p-4 border border-gray-200 space-y-3 font-sans text-xs mx-auto shadow-inner transition-all ${
            paperSize === '58mm' ? 'max-w-[260px]' : 'max-w-[340px]'
          }`}
          id="printable-receipt"
        >
          {printType === 'bill' ? (
            /* --- 1. Customer Bill Layout --- */
            <div className="space-y-3">
              <div className="text-center pb-2.5 border-b border-dashed border-gray-300">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="h-10 w-10 mx-auto rounded-full object-cover border border-primary/20 shadow-2xs mb-1"
                />
                <h2 className="text-sm font-black text-gray-900">
                  {settings.restaurantName || 'သူရစားသောက်ဆိုင်'}
                </h2>
                {settings.phone && (
                  <p className="text-[10px] text-gray-600">ဖုန်း: {settings.phone}</p>
                )}
                {settings.address && (
                  <p className="text-[10px] text-gray-500">{settings.address}</p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">အရောင်းပြေစာ (Customer Invoice)</p>

                <div className="mt-2 pt-1.5 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date().toLocaleDateString()}{' '}
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-gray-800">{tableLabel}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                  <span>ဟင်းပွဲ / ပစ္စည်း</span>
                  <span>ကျသင့်ငွေ</span>
                </div>
                {sale.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-[10px] text-gray-500 block">
                        {item.price?.toLocaleString()} x {item.quantity}
                      </span>
                      {item.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded block mt-0.5 font-medium">
                          📝 {item.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString()} {APP_CONFIG.CURRENCY}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals & Calculations */}
              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1 text-xs">
                {sale.subtotal > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>စုစုပေါင်း (Subtotal)</span>
                    <span>{sale.subtotal.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                  </div>
                )}
                {sale.serviceCharge > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>ဝန်ဆောင်ခ ({settings.serviceChargeRate}%)</span>
                    <span>+ {sale.serviceCharge.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                  </div>
                )}
                {sale.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>ကုန်သွယ်လုပ်ငန်းခွန် ({settings.taxRate}%)</span>
                    <span>+ {sale.tax.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                  </div>
                )}
                {sale.discount_amount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>လျှော့စျေး (Discount)</span>
                    <span>- {sale.discount_amount.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-gray-900 pt-1 border-t">
                  <span>စုစုပေါင်း ကျသင့်ငွေ</span>
                  <span className="text-primary font-black">
                    {sale.total_amount?.toLocaleString()} {APP_CONFIG.CURRENCY}
                  </span>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 space-y-0.5 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span>ငွေပေးချေမှုပုံစံ:</span>
                    <span className="font-bold text-gray-800">{paymentLabel}</span>
                  </div>
                  {sale.payment_method === 'cash' && sale.received_amount > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>ပေးငွေ:</span>
                        <span>{sale.received_amount.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>ပြန်အမ်းငွေ:</span>
                        <span>{(sale.change_amount || 0).toLocaleString()} {APP_CONFIG.CURRENCY}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-gray-200 text-[10px] text-gray-400">
                <p>{settings.receiptFooter || 'ကျေးဇူးတင်ပါသည်၊ နောက်တစ်ခေါက် ပြန်လည်ကြိုဆိုပါသည်'}</p>
                <p>Please Come Again</p>
              </div>
            </div>
          ) : (
            /* --- 2. Kitchen Order Ticket (KOT) Layout --- */
            <div className="space-y-3">
              <div className="text-center pb-2.5 border-b-2 border-black">
                <h2 className="text-base font-black text-gray-900 uppercase tracking-wide">
                  *** KOT မီးဖိုချောင် အော်ဒါ ***
                </h2>
                <div className="mt-2 text-xl font-black text-black">
                  {tableLabel}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-gray-700 font-medium">
                  <span>အော်ဒါ: #{sale.id.slice(0, 6)}</span>
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Items List (Big font for chefs) */}
              <div className="space-y-2 py-1">
                {sale.items?.map((item: any, idx: number) => (
                  <div key={idx} className="border-b border-dashed border-gray-200 pb-1.5 last:border-0">
                    <div className="flex justify-between items-baseline font-black text-sm text-gray-900">
                      <span>{item.name}</span>
                      <span className="text-base font-black bg-gray-100 px-2 py-0.5 rounded">
                        x{item.quantity}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="mt-1 text-xs font-bold text-red-700 bg-red-50 p-1 rounded border border-red-200">
                        ⚠️ မှတ်ချက်: {item.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-black pt-2 text-center text-[10px] font-bold text-gray-700">
                <p>ချက်ပြုတ်/ပြင်ဆင်ပြီးပါက စားပွဲသို့ ပို့ဆောင်ပါ</p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs font-bold" onClick={onClose}>
            ပိတ်မည်
          </Button>
          <Button
            className={`flex-1 gap-1.5 h-10 rounded-xl text-xs font-bold shadow-sm ${
              printType === 'kot'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
            onClick={handlePrint}
          >
            <Printer size={14} />
            <span>{printType === 'bill' ? 'ပြေစာ ထုတ်မည်' : 'KOT စလစ် ထုတ်မည်'}</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Thermal Receipt Print CSS */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${paperSize === '58mm' ? '54mm' : '76mm'} !important;
            max-width: ${paperSize === '58mm' ? '58mm' : '80mm'} !important;
            padding: 3mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-size: ${paperSize === '58mm' ? '10px' : '11px'} !important;
            line-height: 1.3 !important;
          }
        }
      `,
        }}
      />
    </Modal>
  );
}
