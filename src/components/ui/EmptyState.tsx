import React from 'react';
import { FolderX } from 'lucide-react';
import { Button } from './Button';

export default function EmptyState({
  icon = FolderX,
  title = 'အချက်အလက် မရှိပါ',
  description = '',
  actionText = '',
  actionIcon = null,
  onAction = null,
  actionVariant = 'outline',
  className = '',
}) {
  const IconComponent = icon;

  return (
    <div className={`py-14 px-6 text-center rounded-2xl bg-white border border-gray-200/80 max-w-sm mx-auto shadow-xs ${className}`}>
      <div className="h-12 w-12 mx-auto mb-3 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70">
        <IconComponent className="h-6 w-6 opacity-80" />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-xs text-gray-500 mb-4">{description}</p>}
      {onAction && actionText && (
        <Button
          size="sm"
          variant={actionVariant}
          onClick={onAction}
          className="rounded-xl text-xs font-bold h-9 mt-1"
        >
          {actionIcon && <span className="mr-1.5">{actionIcon}</span>}
          {actionText}
        </Button>
      )}
    </div>
  );
}
