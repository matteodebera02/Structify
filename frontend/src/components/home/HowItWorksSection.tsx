import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const STEPS = [
  {
    number: '01',
    title: 'Describe your idea',
    description:
      'Write a few sentences about what you want to build — no templates or structure needed. Plain language works.',
  },
  {
    number: '02',
    title: 'AI structures it',
    description:
      'Structify breaks it down into user stories and tasks, ordered and effort-sized automatically.',
  },
  {
    number: '03',
    title: 'Ship faster',
    description:
      'Export to Linear, Jira, Notion, or GitHub in one click — CSV, Markdown, or JSON. No copy-paste.',
  },
]

export default function HowItWorksSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-warm-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight">
            Write. Generate. Ship.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={cn('flex flex-col', inView ? 'animate-fade-in-up' : 'opacity-0')}
              style={inView ? { animationDelay: `${i * 120}ms` } : undefined}
            >
              <span className="font-mono text-5xl font-bold text-pink-primary leading-none mb-5 select-none">
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-base-black mb-2">{step.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
