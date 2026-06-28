import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const FEATURES = [
  {
    title: 'Plain language in',
    tag: 'AI',
    description:
      "Describe your project as you'd explain it to a teammate. No templates, no structured prompts, no learning curve. Structify figures out the rest.",
  },
  {
    title: 'Structured plan out',
    tag: 'instant',
    description:
      "User stories with acceptance criteria, tasks with effort estimates, priorities set. A plan a real team can execute — generated in under 10 seconds.",
  },
  {
    title: 'Two output modes',
    tag: 'flexible',
    description:
      "US + Tasks for agile teams tracking epics and sprints. Tasks only for solo devs or projects that don't need the story layer. Switch any time, re-generate instantly.",
  },
  {
    title: 'Export to your stack',
    tag: 'portable',
    description:
      "CSV maps directly to Linear, Jira, Notion, Asana. Markdown renders in GitHub, Obsidian, Confluence. JSON for custom pipelines. One click — no reformatting.",
  },
  {
    title: 'Your own Groq key',
    tag: 'unlimited',
    description:
      "Add a free Groq API key in Settings and get unlimited generations. No quota, no wait times, no data leaving through Structify's infrastructure.",
  },
  {
    title: 'Full project dashboard',
    tag: 'persistent',
    description:
      "Every project saved. Re-generate, re-export, or pick up where you left off. Your planning history in one place — not scattered across chat sessions.",
  },
]

export default function FeaturesSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-white py-24 px-6 border-t border-base-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight">
            Everything included.
          </h2>
        </div>

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-base-border border border-base-border rounded-2xl overflow-hidden"
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                'bg-white p-7 flex flex-col gap-3',
                inView ? 'animate-fade-in-up' : 'opacity-0'
              )}
              style={inView ? { animationDelay: `${i * 60}ms` } : undefined}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold text-base-black leading-snug">
                  {f.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-soft text-pink-dark font-semibold flex-shrink-0">
                  {f.tag}
                </span>
              </div>
              <p className="text-sm text-base-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
