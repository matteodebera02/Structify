import type { EffortHours, EffortSize } from '@/types/models'

const EFFORT_CONFIG: Record<EffortSize, { label: string; className: string }> = {
  S: { label: 'Small',  className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  M: { label: 'Medium', className: 'bg-amber-50 text-amber-600 border-amber-200' },
  L: { label: 'Large',  className: 'bg-red-50 text-red-500 border-red-200' },
}

function confidenceColor(value: number): string {
  if (value >= 0.9) return 'text-emerald-600'
  if (value >= 0.6) return 'text-amber-600'
  return 'text-red-500'
}

export interface TaskCardProps {
  title: string
  description?: string
  effort?: EffortSize
  effort_hours?: EffortHours
  confidence?: number
}

export default function TaskCard({ title, description, effort, effort_hours, confidence }: TaskCardProps) {
  return (
    <div className="flex items-start gap-3 bg-base-surface rounded-lg px-4 py-3 border border-base-border/60">
      <div className="w-4 h-4 rounded border-2 border-base-border flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-base-black leading-snug">{title}</p>
        {description && (
          <p className="text-xs text-base-muted mt-0.5 leading-relaxed line-clamp-2">{description}</p>
        )}
        {effort_hours && (
          <p className="text-[10px] text-base-muted mt-1">
            {effort_hours.min}–{effort_hours.max}h
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0 mt-0.5">
        {effort && (
          <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${EFFORT_CONFIG[effort].className}`}>
            {effort} · {EFFORT_CONFIG[effort].label}
          </span>
        )}
        {confidence !== undefined && (
          <span className={`text-[10px] font-medium ${confidenceColor(confidence)}`}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>
    </div>
  )
}
