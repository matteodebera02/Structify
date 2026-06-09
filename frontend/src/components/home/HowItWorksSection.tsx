import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const STEPS = [
  {
    number: '01',
    title: 'Describe your idea',
    description:
      'Write a few sentences about what you want to build — no templates or structure needed.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI structures it',
    description:
      'Structify breaks it down into user stories and tasks, ordered and effort-sized automatically.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Ship faster',
    description:
      'Export to Linear, Jira, Notion, Asana or GitHub in one click — CSV, Markdown, or JSON. No copy-paste.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22 11 13 2 9l20-7z" />
      </svg>
    ),
  },
]

export default function HowItWorksSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight">
            Three steps. Zero overhead.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={cn('flex flex-col', inView ? 'animate-fade-in-up' : 'opacity-0')}
              style={inView ? { animationDelay: `${i * 120}ms` } : undefined}
            >
              <div className="flex items-center gap-4 mb-5">
                <span className="text-4xl font-bold text-base-border leading-none select-none">
                  {step.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-pink-soft flex items-center justify-center text-pink-primary">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-base font-semibold text-base-black mb-2">{step.title}</h3>
              <p className="text-sm text-base-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
