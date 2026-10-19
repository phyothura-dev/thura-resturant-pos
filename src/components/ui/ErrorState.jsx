import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export default function ErrorState({
  title = 'ဒေတာရယူ၍မရပါ',
  message = '',
  onRetry,
  className = '',
}) {
  return (
    <div className={`p-8 text-center rounded-2xl bg-red-50/70 border border-red-100 max-w-sm mx-auto my-6 shadow-xs ${className}`}>
      <div className="h-11 w-11 mx-auto mb-3 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-red-900 mb-1">{title}</h3>
      {message && <p className="text-xs text-red-500 mb-4">{message}</p>}
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="rounded-xl border-red-200 text-red-700 hover:bg-red-100/60 text-xs h-9"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          ပြန်ကြိုးစားမည်
        </Button>
      )}
    </div>
  );
}
