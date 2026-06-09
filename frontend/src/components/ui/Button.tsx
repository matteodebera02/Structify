import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export default function Button({
  variant = 'primary', size = 'md', loading, className, children, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-pink-primary hover:bg-pink-hover text-white',
    secondary: 'bg-base-surface hover:bg-base-border text-base-black border border-base-border',
    ghost: 'hover:bg-base-surface text-base-muted hover:text-base-black',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-6 py-3',
  }
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="mr-2">
          <Spinner size="sm" />
        </span>
      ) : null}
      {children}
    </button>
  )
}
