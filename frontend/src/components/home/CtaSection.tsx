import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

export default function CtaSection() {
  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background: '#0A0A0A',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,51,106,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
          Ready to structure<br />your next project?
        </h2>
        <p className="text-base text-white/40 mb-10">
          Join Structify and turn your ideas into executable project plans — in seconds.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register">
            <Button size="lg">Start for free →</Button>
          </Link>
          <Link to="/login">
            <Button
              variant="ghost"
              size="lg"
              className="text-white/50 hover:text-white hover:bg-white/5"
            >
              Already have an account
            </Button>
          </Link>
        </div>
        <p className="text-xs text-white/20 mt-6">No credit card required.</p>
      </div>
    </section>
  )
}
