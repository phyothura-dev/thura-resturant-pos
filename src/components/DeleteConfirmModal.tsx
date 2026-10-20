import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './ui/Button';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ဖျက်ရန် အတည်ပြုပါ',
  itemName = '',
  itemDescription = '',
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-end p-3 pb-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 pb-6 pt-1 text-center">
          <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-inner">
            <Trash2 className="h-6 w-6" />
          </div>

          <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>

          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <span className="font-semibold text-gray-900">"{itemName}"</span> ကို ဖျက်မည်လား?
            {itemDescription && <span className="block text-xs text-gray-400 mt-1">{itemDescription}</span>}
          </p>

          <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-2.5 mb-5 text-left flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              ပြန်ပြင်၍ မရနိုင်ပါ။
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl h-10 border-gray-200 hover:bg-gray-50 text-xs font-bold"
            >
              မလုပ်တော့ပါ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              isLoading={isLoading}
              className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-700 shadow-sm text-xs font-bold"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              ဖျက်မည်
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
