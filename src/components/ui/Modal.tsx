import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
          <Button size="xs" variant="ghost" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
