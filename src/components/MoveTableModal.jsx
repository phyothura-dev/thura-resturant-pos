import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ArrowRightLeft, UtensilsCrossed, Check } from 'lucide-react';

export default function MoveTableModal({
  isOpen,
  onClose,
  currentTableNumber,
  availableTables = [],
  onConfirmMove,
  isLoading = false,
}) {
  const [selectedTableId, setSelectedTableId] = useState(null);

  const handleConfirm = () => {
    if (!selectedTableId) return;
    onConfirmMove(selectedTableId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="စားပွဲ ပြောင်းရွှေ့မည်">
      <div className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <span className="text-gray-500">လက်ရှိ စားပွဲ:</span>
          <span className="font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
            စားပွဲ - {currentTableNumber}
          </span>
        </div>

        {/* Available Tables Grid */}
        <div>
          <label className="text-xs font-bold text-gray-700 mb-2 block">
            ပြောင်းရွှေ့မည့် စားပွဲဝိုင်း ရွေးချယ်ပါ
          </label>

          {availableTables.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-xs">
              ပြောင်းရွှေ့ရန် အားလပ်နေသော စားပွဲဝိုင်း မရှိသေးပါ
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {availableTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const num = table.table_number || table.id;
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-black shadow-xs ring-2 ring-primary/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <UtensilsCrossed className="h-4 w-4 mb-1 opacity-70" />
                    <span className="text-sm font-black">စားပွဲ {num}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary mt-0.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl h-10 text-xs font-bold"
          >
            မလုပ်တော့ပါ
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTableId || isLoading}
            isLoading={isLoading}
            className="flex-1 rounded-xl h-10 text-xs font-bold bg-primary hover:bg-primary/90"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
            စားပွဲ ပြောင်းမည်
          </Button>
        </div>
      </div>
    </Modal>
  );
}
