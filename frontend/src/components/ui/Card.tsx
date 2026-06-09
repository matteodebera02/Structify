import { cn } from '@/utils/cn'
import type { HTMLAttributes } from 'react'

export default function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white border border-base-border rounded-lg p-4', className)} {...props}>
      {children}
    </div>
  )
}
