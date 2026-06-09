import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterPage() {
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const fromGenerate = searchParams.get('from') === 'generate'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({ email, password })
    } catch {
      setError('Could not create account. This email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = () => showPassword ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  return (
    <AuthLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-black tracking-tight mb-1.5">Create your account</h1>
          <p className="text-sm text-base-muted">Free forever. No credit card required.</p>
        </div>

        {fromGenerate && (
          <div className="bg-pink-soft border border-pink-primary/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs font-semibold text-pink-dark mb-0.5">✦ Your project description is saved</p>
            <p className="text-xs text-pink-dark/70">
              Create your free account and we'll generate the structure right away — no extra steps.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-base-black">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 pr-10 text-sm bg-base-surface border border-base-border rounded-md outline-none placeholder:text-base-muted focus:border-pink-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-muted hover:text-base-black transition-colors"
                tabIndex={-1}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-base-black">Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-base-surface border border-base-border rounded-md outline-none placeholder:text-base-muted focus:border-pink-primary transition-colors"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={e => setPrivacyAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-base-border accent-pink-primary cursor-pointer"
            />
            <span className="text-[11px] text-base-muted leading-relaxed">
              I have read and accept the{' '}
              <Link to="/privacy" className="text-pink-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={!email || !password || !confirmPassword || !privacyAccepted}
          >
            Create account →
          </Button>
        </form>

        <p className="text-sm text-base-muted text-center mt-6">
          Already have an account?{' '}
          <Link
            to={fromGenerate ? '/login?from=generate' : '/login'}
            className="text-pink-primary hover:text-pink-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
