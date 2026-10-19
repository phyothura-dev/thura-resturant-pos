import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
  type = 'table',
  rows = 5,
  cols = 3,
  className = '',
}) {
  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center justify-center h-64 gap-2 text-gray-400 ${className}`}>
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs font-medium">ခေတ္တစောင့်ပါ...</span>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
        {[...Array(rows * 2)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3 space-y-2.5 animate-pulse">
            <div className="aspect-[4/3] rounded-xl bg-gray-200/80 w-full" />
            <div className="h-4 bg-gray-200/80 rounded-md w-3/4" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-4 bg-gray-200/80 rounded-md w-1/3" />
              <div className="h-6 w-12 bg-gray-200/80 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // default: 'table'
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs animate-pulse ${className}`}>
      <div className="h-11 bg-gray-50/80 border-b border-gray-200 flex items-center px-4 gap-4">
        {[...Array(cols)].map((_, c) => (
          <div
            key={c}
            className={`h-4 bg-gray-200/70 rounded-md ${c === 0 ? 'w-12' : c === cols - 1 ? 'w-20 ml-auto' : 'flex-1 max-w-[160px]'}`}
          />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {[...Array(rows)].map((_, r) => (
          <div key={r} className="h-14 flex items-center px-4 gap-4">
            {[...Array(cols)].map((_, c) => (
              <div
                key={c}
                className={`h-3.5 bg-gray-200/60 rounded-md ${c === 0 ? 'w-8' : c === cols - 1 ? 'w-16 ml-auto' : 'flex-1 max-w-[200px]'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
