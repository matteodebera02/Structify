import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '@/components/auth/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { authApi } from '@/api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout>
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-base-black tracking-tight mb-1.5">Check your inbox</h1>
            <p className="text-sm text-base-muted">
              If <span className="font-medium text-base-black">{email}</span> is registered, you'll get a reset link shortly. It expires in 15 minutes.
            </p>
          </div>
          <Link
            to="/login"
            className="text-sm text-pink-primary hover:text-pink-hover font-medium transition-colors"
          >
            ← Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-base-black tracking-tight mb-1.5">Forgot password?</h1>
          <p className="text-sm text-base-muted">Enter your email and we'll send you a reset link.</p>
        </div>

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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading} disabled={!email}>
            Send reset link →
          </Button>
        </form>

        <p className="text-sm text-base-muted text-center mt-6">
          <Link to="/login" className="text-pink-primary hover:text-pink-hover font-medium transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
