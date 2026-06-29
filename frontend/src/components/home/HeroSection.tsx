import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import AnimatedTerminal from './AnimatedTerminal'
import WordCycler from './WordCycler'

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden"
      style={{
        background: '#141210',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Subtle pink glow — top left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-5%',
          left: '-15%',
          width: '65%',
          height: '70%',
          background: 'radial-gradient(ellipse, rgba(232,51,106,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 mb-8 animate-fade-in-up"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-pink-primary" />
              <span className="text-xs text-white/50 font-medium">AI-powered project planning</span>
            </div>

            <h1
              className="text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.1] tracking-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: '80ms' }}
            >
              Build your <WordCycler /><br />
              Get a project plan<br />
              in seconds.
            </h1>

            <p
              className="text-base text-white/45 leading-relaxed mb-10 max-w-md animate-fade-in-up"
              style={{ animationDelay: '180ms' }}
            >
              Describe what you're building in plain language. Structify uses AI to generate
              structured user stories and tasks — ready to export into your tools.
            </p>

            <div
              className="flex items-center gap-4 flex-wrap animate-fade-in-up"
              style={{ animationDelay: '280ms' }}
            >
              <Link to="/register">
                <Button size="lg">Start for free →</Button>
              </Link>
              <a href="#demo">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white/50 hover:text-white hover:bg-white/5"
                >
                  Try it now
                </Button>
              </a>
            </div>

            <div
              className="mt-5 space-y-1 animate-fade-in-up"
              style={{ animationDelay: '360ms' }}
            >
              <p className="text-xs text-white/25">No credit card required.</p>
              <p className="text-xs text-white/15">
                Free shared quota included · add your own{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/50 underline underline-offset-2 transition-colors"
                >
                  free Groq key
                </a>
                {' '}in Settings for unlimited access.
              </p>
            </div>
          </div>

          {/* Right — animated terminal */}
          <div
            className="flex justify-center lg:justify-end animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <div className="relative">
              <AnimatedTerminal />
              {/* Glow halo behind terminal */}
              <div
                className="absolute -inset-8 -z-10 rounded-3xl blur-3xl opacity-20"
                style={{ background: 'radial-gradient(ellipse, #E8336A 0%, transparent 65%)' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
