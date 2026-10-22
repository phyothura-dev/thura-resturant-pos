import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { ArrowRightLeft, UtensilsCrossed, Check, Merge, AlertTriangle } from 'lucide-react';

export default function MoveTableModal({
  isOpen,
  onClose,
  currentTableNumber,
  availableTables = [],
  occupiedTables = [],
  onConfirmMove,
  onConfirmMerge,
  isLoading = false,
}) {
  const [activeTab, setActiveTab] = useState<'move' | 'merge'>('move');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selectedTableId) return;
    if (activeTab === 'move') {
      onConfirmMove(selectedTableId);
    } else {
      onConfirmMerge?.(selectedTableId);
    }
  };

  const selectedOccupiedTable = occupiedTables.find((t) => t.id === selectedTableId);
  const targetNumber = selectedOccupiedTable?.table_number || selectedOccupiedTable?.id;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeTab === 'move' ? 'စားပွဲ ပြောင်းရွှေ့မည်' : 'စားပွဲ ပေါင်းစည်းမည် (Merge)'}
    >
      <div className="space-y-4">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('move');
              setSelectedTableId(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'move'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowRightLeft size={13} />
            <span>စားပွဲ ရွှေ့မည်</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('merge');
              setSelectedTableId(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'merge'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Merge size={13} />
            <span>စားပွဲ ပေါင်းမည်</span>
          </button>
        </div>

        {/* Current Table Info */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
          <span className="text-gray-500">လက်ရှိ စားပွဲ:</span>
          <span className="font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
            စားပွဲ - {currentTableNumber}
          </span>
        </div>

        {/* Mode: Move Table */}
        {activeTab === 'move' && (
          <div>
            <label className="text-xs font-bold text-gray-700 mb-2 block">
              ပြောင်းရွှေ့မည့် အားလပ်သော စားပွဲဝိုင်း ရွေးချယ်ပါ
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
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-black shadow-2xs ring-2 ring-primary/20'
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
        )}

        {/* Mode: Merge Table */}
        {activeTab === 'merge' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              ပေါင်းစည်းမည့် အော်ဒါရှိသော စားပွဲဝိုင်း ရွေးချယ်ပါ
            </label>

            {occupiedTables.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 text-xs">
                ပေါင်းစည်းနိုင်သော အခြားအော်ဒါရှိသည့် စားပွဲ မရှိသေးပါ
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                {occupiedTables.map((table) => {
                  const isSelected = selectedTableId === table.id;
                  const num = table.table_number || table.id;
                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => setSelectedTableId(table.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-black shadow-2xs ring-2 ring-blue-300'
                          : 'border-red-200 bg-red-50/50 hover:border-red-300 text-red-900'
                      }`}
                    >
                      <UtensilsCrossed className="h-4 w-4 mb-1 opacity-70" />
                      <span className="text-sm font-black">စားပွဲ {num}</span>
                      <span className="text-[10px] opacity-75 font-medium">အော်ဒါရှိ</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedTableId && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <b>စားပွဲ - {currentTableNumber}</b> မှ အော်ဒါများကို <b>စားပွဲ - {targetNumber}</b> ထဲသို့ ပေါင်းစည်းပြီးနောက် စားပွဲ - {currentTableNumber} အား အားလပ်စေပါမည်။
                </p>
              </div>
            )}
          </div>
        )}

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
            className={`flex-1 rounded-xl h-10 text-xs font-bold ${
              activeTab === 'merge'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {activeTab === 'merge' ? (
              <>
                <Merge className="h-3.5 w-3.5 mr-1.5" />
                စားပွဲ ပေါင်းမည်
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5" />
                စားပွဲ ပြောင်းမည်
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
