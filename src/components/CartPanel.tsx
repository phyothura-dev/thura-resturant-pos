import { useState, memo } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, Save, CreditCard, MessageSquare, Check, X, Ban } from 'lucide-react';
import { Button } from './ui/Button';
import { APP_CONFIG } from '@/config/constants';

const QUICK_NOTES = ['ချိုပေါ့', 'ကျဆိမ့်', 'ပေါ့ကျ', 'ရေခဲလျှော့', 'သကြားမပါ', 'အစပ်လျှော့', 'အချိုမှုန့်မပါ'];

function CartItem({ item, onUpdateQuantity, onRemove, onUpdateNotes }) {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(item.notes || '');

  const handleSaveNote = () => {
    onUpdateNotes(item.id, noteText.trim());
    setIsEditingNote(false);
  };

  const handleQuickNote = (chip) => {
    const newText = noteText ? `${noteText}, ${chip}` : chip;
    setNoteText(newText);
    onUpdateNotes(item.id, newText);
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-primary/30 transition-all group">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.name}</h4>
        <span className="text-sm font-bold text-primary shrink-0">
          {(item.price * item.quantity).toLocaleString()} {APP_CONFIG.CURRENCY}
        </span>
      </div>

      {/* Note Badge if exists and not editing */}
      {item.notes && !isEditingNote && (
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg">
            📝 {item.notes}
          </span>
          <button
            onClick={() => setIsEditingNote(true)}
            className="text-[10px] text-gray-400 hover:text-gray-600 underline"
          >
            ပြင်မည်
          </button>
        </div>
      )}

      {/* Note Editing Collapsible */}
      {isEditingNote && (
        <div className="p-2.5 rounded-xl bg-white border border-gray-200 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="မှာကြားချက်"
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <Button size="xs" variant="primary" onClick={handleSaveNote} className="h-7 px-2">
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setNoteText(item.notes || '');
                setIsEditingNote(false);
              }}
              className="h-7 px-1.5"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Quick Myanmar Food/Drink Chips */}
          <div className="flex flex-wrap gap-1">
            {QUICK_NOTES.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickNote(chip)}
                className="text-[10px] px-2 py-0.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
              >
                +{chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item Controls */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span>{item.price.toLocaleString()} {APP_CONFIG.CURRENCY}</span>
          {!isEditingNote && (
            <button
              onClick={() => setIsEditingNote((prev) => !prev)}
              className="text-gray-400 hover:text-primary transition-colors flex items-center gap-0.5 text-[11px]"
              title="မှာကြားချက် ထည့်မည်"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{item.notes ? '' : 'မှတ်ချက်'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="icon"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="hover:bg-white hover:shadow-xs rounded-lg border bg-white/70 transition-all h-7 w-7"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-5 text-center font-bold text-gray-900">{item.quantity}</span>
          <Button
            variant="icon"
            size="icon"
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="hover:bg-white hover:shadow-xs rounded-lg border bg-white/70 transition-all h-7 w-7"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="icon"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:bg-red-50 hover:border-red-100 rounded-lg bg-white/70 ml-1 transition-all h-7 w-7"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const MemoizedCartItem = memo(CartItem);

export default function CartPanel({
  cart,
  pendingSaleId,
  subtotal,
  tax = 0,
  serviceCharge = 0,
  taxRate = 5,
  serviceChargeRate = 5,
  total,
  isSaving,
  isCheckingOut,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
  onClear,
  onSave,
  onCheckout,
  orderType = 'dine_in',
  onCancelOrder,
  isCancelling = false,
}: any) {
  const isEmpty = cart.length === 0;

  return (
    <div className="w-full lg:w-[360px] flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm lg:h-full max-h-[75vh] lg:max-h-none transition-all duration-300">
      {/* Cart Header */}
      <div className="p-3.5 border-b bg-primary flex items-center justify-between text-white shadow-xs">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4.5 w-4.5" />
          <h2 className="font-bold text-sm">ခြင်း</h2>
          <span className="text-xs font-normal opacity-85">({cart.length} မျိုး)</span>
        </div>
        <div className="flex items-center gap-1.5">
          {pendingSaleId && (
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
              #{pendingSaleId.slice(0, 6)}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-white hover:bg-white/20 px-2 rounded-lg"
            disabled={isEmpty}
            title="ခြင်း ရှင်းမည်"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 min-h-[200px] custom-scrollbar">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <ShoppingCart size={48} className="mb-3 opacity-15" />
            <p className="text-sm font-semibold text-gray-500">ခြင်းထဲတွင် ပစ္စည်းမရှိသေးပါ</p>
            <p className="text-xs text-gray-400 mt-0.5">မီနူးများကို နှိပ်၍ ထည့်သွင်းပါ</p>
          </div>
        ) : (
          cart.map((item) => (
            <MemoizedCartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              onUpdateNotes={onUpdateNotes}
            />
          ))
        )}
      </div>

      {/* Cart Footer & Totals */}
      <div className="p-4 border-t bg-gray-50/70 space-y-3">
        <div className="space-y-1.5 border-b border-dashed border-gray-200 pb-2.5">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>စုစုပေါင်း</span>
            <span className="font-semibold text-gray-700">
              {subtotal.toLocaleString()} {APP_CONFIG.CURRENCY}
            </span>
          </div>

          {serviceCharge > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>ဝန်ဆောင်ခ ({serviceChargeRate}%)</span>
              <span className="font-semibold text-blue-700">
                +{serviceCharge.toLocaleString()} {APP_CONFIG.CURRENCY}
              </span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>ကုန်သွယ်လုပ်ငန်းခွန် ({taxRate}%)</span>
              <span className="font-semibold text-emerald-700">
                +{tax.toLocaleString()} {APP_CONFIG.CURRENCY}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-600">ကျသင့်ငွေ</span>
          <span className="text-lg font-black text-primary">
            {total.toLocaleString()} {APP_CONFIG.CURRENCY}
          </span>
        </div>

        <div className="flex gap-2">
          {pendingSaleId && (
            <Button variant="outline" size="sm" className="h-11 rounded-xl border-red-200 px-3 text-red-700 hover:bg-red-50" disabled={isSaving || isCheckingOut || isCancelling} onClick={onCancelOrder} title="အော်ဒါပယ်ဖျက်မည်">
              {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            </Button>
          )}
          {orderType === 'dine_in' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs font-bold h-11 transition-all rounded-xl border-gray-200 hover:bg-gray-100"
              disabled={isEmpty || isSaving}
              onClick={onSave}
            >
              {isSaving ? (
                <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  အော်ဒါတင်မည်
                </>
              )}
            </Button>
          )}

          <Button
            size="sm"
            className="flex-1 text-xs font-bold h-11 shadow-sm hover:shadow-md transition-all rounded-xl bg-primary hover:bg-primary/90"
            disabled={isEmpty || isCheckingOut}
            onClick={onCheckout}
          >
            {isCheckingOut ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-1.5" />
                ငွေရှင်းမည်
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
