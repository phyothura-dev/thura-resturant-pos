import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Printer, CheckCircle2, ShoppingBag, Calendar } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

export default function InvoiceModal({ isOpen, onClose, sale }) {
  if (!sale) return null;

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const isTakeaway = sale.order_type === 'takeaway' || !sale.table;
  const tableLabel = isTakeaway
    ? 'ပါဆယ် (Takeaway)'
    : sale.expand?.table?.table_number
      ? `စားပွဲ - ${sale.expand.table.table_number}`
      : `စားပွဲ - ${sale.table || 'Dine-in'}`;

  const paymentLabel =
    sale.payment_method === 'kpay'
      ? 'KBZPay'
      : sale.payment_method === 'wavepay'
        ? 'WavePay'
        : sale.payment_method === 'banking'
          ? 'Banking'
          : 'ငွေသား';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ငွေရှင်းပြေစာ">
      <div className="space-y-4">
        {/* Success header */}
        <div className="flex flex-col items-center justify-center text-center py-1">
          <div className="bg-emerald-100 p-2.5 rounded-full ring-4 ring-emerald-50 mb-1.5">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-gray-900">ငွေရှင်းခြင်း အောင်မြင်ပါသည်</h3>
          <p className="text-xs text-gray-500 font-mono">ဘောင်ချာ: #{sale.id.slice(0, 8)}</p>
        </div>

        {/* 80mm Printable Receipt Card */}
        <div
          className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3 font-sans text-xs max-w-sm mx-auto shadow-inner"
          id="printable-receipt"
        >
            <div className="space-y-3">
              <div className="text-center pb-2.5 border-b border-dashed border-gray-300">
                <img
                  src="/logo.jpeg"
                  alt="Logo"
                  className="h-10 w-10 mx-auto rounded-full object-cover border border-primary/20 shadow-xs mb-1"
                />
                <h2 className="text-sm font-black text-gray-900">သူရစားသောက်ဆိုင်</h2>
                <p className="text-[10px] text-gray-500">အရောင်းပြေစာ (Invoice)</p>

                <div className="mt-2 pt-1.5 border-t border-dashed border-gray-200 flex justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-gray-700">{tableLabel}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-1 border-b">
                  <span>ဟင်းပွဲ / ပစ္စည်း</span>
                  <span>ကျသင့်ငွေ</span>
                </div>
                {sale.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-semibold text-gray-800">{item.name}</span>
                      <span className="text-[10px] text-gray-500 block">
                        {item.price?.toLocaleString()} x {item.quantity}
                      </span>
                      {item.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded block mt-0.5 font-medium">
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
                <p>ကျေးဇူးတင်ပါသည်</p>
                <p>Please Come Again</p>
              </div>
            </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" className="flex-1 h-10 rounded-xl text-xs font-bold" onClick={onClose}>
            ပိတ်မည်
          </Button>
          <Button
            className="flex-1 gap-1.5 h-10 rounded-xl text-xs font-bold shadow-sm"
            onClick={handlePrint}
          >
            <Printer size={14} />
            ပြေစာထုတ်မည်
          </Button>
        </div>
      </div>

      {/* 80mm Thermal Receipt Print CSS */}
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
            width: 80mm !important;
            max-width: 80mm !important;
            padding: 4mm !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
        }
      `,
        }}
      />
    </Modal>
  );
}
