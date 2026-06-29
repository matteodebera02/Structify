import { useInView } from '@/hooks/useInView'
import { cn } from '@/utils/cn'

const FAQS = [
  {
    q: 'Is it actually free?',
    a: "Yes — no credit card, no trial. Structify includes a shared Groq quota for everyone. Add your own free Groq key in Settings for unlimited, unthrottled access.",
  },
  {
    q: 'What kind of projects work best?',
    a: "Any software or tech project: web apps, mobile apps, APIs, internal tools, SaaS platforms, integrations. The more context you give (stack, team size, scope), the sharper the output.",
  },
  {
    q: 'How good is the AI output?',
    a: "Structify runs on a powerful AI model via Groq's inference API. Most users find the output usable as-is. Complex projects benefit from a sentence or two of extra context — stack, team size, rough scope.",
  },
  {
    q: "US + Tasks vs Tasks only — what's the difference?",
    a: '"US + Tasks" gives you User Stories with nested tasks — ideal for sprint planning. "Tasks only" is a flat prioritized list — better for solo work or projects that don\'t need the story layer.',
  },
  {
    q: 'Can I edit or re-generate the plan?',
    a: "Every project lands in your dashboard. Re-generate with a different description, switch output mode, export any time. Your history stays — it doesn't disappear after the session.",
  },
  {
    q: 'What if I hit the rate limit?',
    a: "The shared quota allows up to 10 requests per hour. Add your own free Groq key in Settings and the limit disappears entirely — it's your key, your quota.",
  },
]

export default function FaqSection() {
  const { ref, inView } = useInView()

  return (
    <section className="bg-warm-surface py-24 px-6 border-t border-base-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight">
            Good to know.
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FAQS.map((faq, i) => (
            <div
              key={faq.q}
              className={cn(
                'bg-white border border-base-border rounded-2xl p-6 flex flex-col gap-3',
                inView ? 'animate-fade-in-up' : 'opacity-0'
              )}
              style={inView ? { animationDelay: `${i * 70}ms` } : undefined}
            >
              <p className="text-sm font-semibold text-base-black leading-snug">{faq.q}</p>
              <p className="text-sm text-base-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
