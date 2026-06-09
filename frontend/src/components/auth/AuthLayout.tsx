import { Link } from 'react-router-dom'
import logo from '@/img/no-bg-logo.png'
import type { ReactNode } from 'react'

const FEATURES = [
  'AI-generated user stories and tasks',
  'Plain language → structured project plan',
  'Export to Markdown & JSON',
]

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

interface Props {
  children: ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen flex">

      {/* Left panel — brand */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-10 relative overflow-hidden animate-fade-in"
        style={{
          background: '#0A0A0A',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Pink glow bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-96 h-96 -z-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,51,106,0.15) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5">
          <img src={logo} alt="Structify" className="h-8 w-auto" />
          <span className="text-white font-semibold text-base tracking-tight">Structify</span>
        </Link>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-6">
            Structure your projects<br />with AI.
          </h2>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-pink-primary/15 border border-pink-primary/30 flex items-center justify-center text-pink-primary flex-shrink-0">
                  <CheckIcon />
                </span>
                <span className="text-sm text-white/55">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-white/20">© {new Date().getFullYear()} Structify</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 px-6 pt-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Structify" className="h-7 w-auto" />
            <span className="font-semibold text-base-black">Structify</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-fade-in-up">
            {children}
          </div>
        </div>

        <div className="px-6 pb-6 text-center lg:hidden">
          <Link to="/" className="text-xs text-base-muted hover:text-base-black transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>

    </div>
  )
}
