import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CustomSelect - A styled dropdown that replaces native <select>
 * Props:
 *   value: current selected value
 *   onChange: (value) => void
 *   options: [{ value, label }]
 *   placeholder: string
 *   icon: React node (left icon)
 *   className: string
 */
export default function CustomSelect({ value, onChange, options = [], placeholder, icon, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 h-10 pl-3 pr-2.5 rounded-xl border text-sm font-medium transition-all whitespace-nowrap',
          'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300',
          open && 'bg-white border-primary ring-2 ring-primary/20 text-gray-900'
        )}
      >
        {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
        <span className="truncate max-w-[140px]">
          {selectedOption?.label ?? placeholder ?? 'ရွေးချယ်ပါ'}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 min-w-full min-w-[180px] bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <ul className="py-1.5 max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors text-left',
                      isSelected
                        ? 'bg-primary/8 text-primary font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export { CustomSelect };
