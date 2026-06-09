import { cn } from '@/utils/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-base-black">{label}</label>}
      <input
        className={cn(
          'w-full px-3 py-2 text-sm bg-base-surface border border-base-border rounded-md outline-none',
          'placeholder:text-base-muted focus:border-pink-primary transition-colors',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
