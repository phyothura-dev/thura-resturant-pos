import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({ className = '', variant = 'primary', size = 'default', isLoading = false, children, ...props }) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    destructive: 'bg-red-500 text-white hover:bg-red-500/90',
    outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
    ghost: 'hover:bg-slate-100 hover:text-slate-900',
    link: 'text-slate-500 underline-offset-4 hover:underline',
    icon: 'transition-colors',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    xs: 'h-8 rounded-md px-2',
    icon: 'h-7 w-7 p-0 rounded-md',
  };

  const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={styles} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin " />}
      {children}
    </button>
  );
}
