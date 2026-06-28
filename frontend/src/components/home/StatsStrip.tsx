const STATS = [
  { value: '3',   label: 'export formats' },
  { value: '2',   label: 'output modes' },
  { value: '12+', label: 'compatible tools' },
  { value: '0',   label: 'credit cards required' },
]

export default function StatsStrip() {
  return (
    <section className="bg-warm-white border-y border-base-border py-9 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map(stat => (
          <div key={stat.label} className="text-center">
            <div className="font-mono text-2xl font-bold text-base-black tracking-tight">
              {stat.value}
            </div>
            <div className="text-xs text-warm-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
