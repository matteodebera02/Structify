import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'AI-generated in seconds',
    description:
      'Describe your project in plain language and get a complete, structured plan instantly — no templates, no manual effort.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Two output modes',
    description:
      'Generate full User Stories + Tasks for agile teams, or just a flat task list if you prefer a simpler workflow.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: 'Export to any tool',
    description:
      'Download as CSV for Linear, Notion or Asana — as Markdown for GitHub and Obsidian — or as JSON for custom pipelines. One click, zero reformatting.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Personal dashboard',
    description:
      'All your projects in one place. Track progress, iterate on structure, and manage tasks directly from your dashboard.',
  },
]

export default function FeaturesSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-white py-24 px-6 border-t border-base-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight">
            Everything you need to plan better.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                'bg-base-surface border border-base-border rounded-2xl p-6',
                'hover:border-pink-primary/30 hover:-translate-y-1 hover:shadow-md',
                'transition-all duration-200',
                inView ? 'animate-fade-in-up' : 'opacity-0'
              )}
              style={inView ? { animationDelay: `${i * 80}ms` } : undefined}
            >
              <div className="w-10 h-10 rounded-xl bg-pink-soft flex items-center justify-center text-pink-primary mb-4">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-base-black mb-2">{f.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
