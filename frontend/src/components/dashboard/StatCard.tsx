interface StatCardProps {
  label: string
  value: string | number
  subText?: string
  highlight?: string
}

export default function StatCard({ label, value, subText, highlight }: StatCardProps) {
  return (
    <div className="bg-base-surface rounded-xl p-4">
      <p className="text-[11px] text-base-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-semibold text-base-black leading-none mb-1.5">{value}</p>
      {(subText || highlight) && (
        <p className="text-[11px] text-base-muted">
          {highlight && <span className="text-pink-primary font-medium">{highlight} </span>}
          {subText}
        </p>
      )}
    </div>
  )
}
