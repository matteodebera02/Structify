import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import { settingsApi } from '@/api/settingsApi'
import { useAuthStore } from '@/store/authStore'
import type { UserSettings } from '@/types/api'
import { cn } from '@/utils/cn'

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const [keyInput, setKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    settingsApi.getMe()
      .then(setSettings)
      .finally(() => setLoading(false))
  }, [])

  const showFeedback = (type: 'ok' | 'err', msg: string) => {
    setFeedback({ type, msg })
    setTimeout(() => setFeedback(null), 3500)
  }

  const handleSaveKey = async () => {
    if (!keyInput.trim()) return
    setSaving(true)
    try {
      const updated = await settingsApi.updateGroqKey(keyInput.trim())
      setSettings(updated)
      setKeyInput('')
      showFeedback('ok', 'API key saved successfully.')
    } catch {
      showFeedback('err', 'Failed to save key. Check that it is a valid Groq API key.')
    } finally {
      setSaving(false)
    }
  }

  const handleClearKey = async () => {
    setClearing(true)
    try {
      const updated = await settingsApi.updateGroqKey('')
      setSettings(updated)
      showFeedback('ok', 'API key removed.')
    } catch {
      showFeedback('err', 'Failed to remove key.')
    } finally {
      setClearing(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await settingsApi.deleteAccount()
      logout()
      navigate('/')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-base-muted mb-8">
          <Link to="/dashboard" className="hover:text-base-black transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-base-black font-medium">Settings</span>
        </div>

        <h1 className="text-lg font-semibold text-base-black tracking-tight mb-8">Account settings</h1>

        {/* Account info */}
        <section className="border border-base-border rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-base-black uppercase tracking-wider mb-4">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-base-muted mb-0.5">Email</p>
              <p className="text-sm font-medium text-base-black">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Groq API key */}
        <section className="border border-base-border rounded-xl p-5 mb-4">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h2 className="text-xs font-semibold text-base-black uppercase tracking-wider mb-1">
                Groq API Key
              </h2>
              <p className="text-xs text-base-muted leading-relaxed">
                Add your own key to use your personal quota instead of the shared one.
                Get a free key at{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-primary hover:underline"
                >
                  console.groq.com/keys
                </a>
                .
              </p>
            </div>
            {!loading && settings?.has_groq_key && (
              <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100 font-semibold">
                Active
              </span>
            )}
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-9 bg-base-surface rounded-md animate-pulse" />
            ) : settings?.has_groq_key ? (
              /* Key is set — show preview + clear */
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-base-surface border border-base-border rounded-md">
                  <span className="flex-1 text-sm font-mono text-base-muted truncate">
                    {settings.groq_key_preview}
                  </span>
                </div>
                <p className="text-xs text-base-muted">
                  To update the key, remove the current one and add a new one.
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={clearing}
                  onClick={handleClearKey}
                >
                  Remove key
                </Button>
              </div>
            ) : (
              /* No key — show input */
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveKey()}
                    placeholder="gsk_••••••••••••••••••••••••••••••••••••••••••••••••••"
                    className="w-full px-3 py-2 pr-20 text-sm font-mono bg-base-surface border border-base-border rounded-md outline-none focus:border-pink-primary transition-colors placeholder:text-base-muted/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-base-muted hover:text-base-black transition-colors"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
                <Button
                  size="sm"
                  loading={saving}
                  disabled={!keyInput.trim()}
                  onClick={handleSaveKey}
                >
                  Save key →
                </Button>
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={cn(
              'mt-4 px-4 py-2.5 rounded-lg text-xs font-medium',
              feedback.type === 'ok'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            )}>
              {feedback.msg}
            </div>
          )}

          {/* Info box */}
          <div className="mt-5 bg-base-surface rounded-lg px-4 py-3">
            <p className="text-xs text-base-muted leading-relaxed">
              <span className="font-semibold text-base-black">How it works:</span> When a key is set,
              all your generations use your personal Groq quota. Without it, a shared key is used
              which has a limited daily budget.
            </p>
          </div>
        </section>
        {/* Danger zone */}
        <section className="border border-red-200 rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Danger zone</h2>
          <p className="text-xs text-base-muted mb-4">
            Deleting your account is permanent and cannot be undone. All your projects, user stories, and tasks will be erased immediately.
          </p>
          {!confirmDelete ? (
            <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 space-y-3">
              <p className="text-xs font-semibold text-red-700">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Cancel
                </Button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Footer links */}
        <div className="flex items-center gap-4 pt-2 pb-8">
          <Link to="/privacy" className="text-xs text-base-muted hover:text-base-black transition-colors">
            Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  )
}
