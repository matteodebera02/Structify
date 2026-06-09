import { cn } from '@/utils/cn'

interface BadgeProps {
  label: string
  variant?: 'effort' | 'default'
  className?: string
}

export default function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
      variant === 'effort' && 'bg-pink-soft text-pink-dark',
      variant === 'default' && 'bg-base-surface text-base-muted border border-base-border',
      className
    )}>
      {label}
    </span>
  )
}
