import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useGenerateStore } from '@/store/generateStore'
import Button from '@/components/ui/Button'

export default function CtaSection() {
  const [description, setDescription] = useState('')
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    useGenerateStore.getState().setDescription(description.trim())
    if (isAuthenticated) {
      document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/register?from=generate')
    }
  }

  return (
    <section
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background: '#141210',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Bottom pink glow */}
      <div
        className="absolute inset-0 -z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,51,106,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-4">
          Ready when you are
        </p>
        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-3">
          What are you building?
        </h2>
        <p className="text-sm text-white/35 mb-10">
          Describe it below — get a full project plan in seconds.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="An e-commerce app with user authentication, product catalog, shopping cart and Stripe payments..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 outline-none focus:border-pink-primary/60 transition-colors resize-none font-sans"
          />
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={!description.trim()}
              className="w-full sm:w-auto"
            >
              Generate →
            </Button>
          </div>
        </form>

        <p className="text-xs text-white/20 mt-6">
          Free to start · No credit card · Add your own Groq key for unlimited access
        </p>
      </div>
    </section>
  )
}
