import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGenerate } from '@/hooks/useGenerate'
import { useProjects } from '@/hooks/useProjects'
import { useAuthStore } from '@/store/authStore'
import { useGenerateStore } from '@/store/generateStore'
import GenerateForm from '@/components/generate/GenerateForm'
import GenerateResultPreview from './GenerateResultPreview'
import RateLimitBanner from '@/components/generate/RateLimitBanner'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import type { OutputMode } from '@/types/models'

export default function LiveDemoSection() {
  const { generate, result, description, mode, isLoading, error, rateLimit, reset } = useGenerate()
  const { createProject } = useProjects()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  const handleGenerate = (desc: string, m: OutputMode) => {
    if (!isAuthenticated) {
      useGenerateStore.getState().setDescription(desc)
      useGenerateStore.getState().setMode(m)
      navigate('/register?from=generate')
      return
    }
    generate({ description: desc, mode: m })
  }

  const handleSave = async () => {
    if (!result || !description) return
    setSaving(true)
    try {
      const project = await createProject({
        title: result.project_title || 'Untitled project',
        description,
        mode,
        generated: result,
      })
      reset()
      navigate(`/projects/${project.id}`)
    } catch {
      console.error('[demo] save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section id="demo" className="bg-base-surface py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-3">Live demo</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-base-black tracking-tight mb-4">
            Try it yourself.
          </h2>
          <p className="text-base text-base-muted mb-4">
            Describe any project and see Structify generate the structure in seconds.
          </p>
          <p className="text-xs text-base-muted/70">
            ⚡ Free shared quota included —{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-primary hover:underline"
            >
              add your own free Groq key
            </a>
            {' '}in Settings for unlimited access.
          </p>
        </div>

        <div className="bg-white border border-base-border rounded-2xl p-6 shadow-sm mb-6">
          <GenerateForm onGenerate={handleGenerate} loading={isLoading} />
        </div>

        {isLoading && (
          <div className="bg-white border border-base-border rounded-2xl p-10 shadow-sm mb-6 flex flex-col items-center gap-4">
            <div className="text-pink-primary">
              <Spinner size="lg" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-base-black mb-1">Generating your structure</p>
              <p className="text-xs text-base-muted">The AI is analyzing your project — this takes a few seconds.</p>
            </div>
          </div>
        )}

        {rateLimit && !isLoading && (
          <div className="mb-6">
            <RateLimitBanner waitTime={rateLimit} />
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && !isLoading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-base-black">Generated structure</p>
              <button
                onClick={reset}
                className="text-xs text-base-muted hover:text-base-black transition-colors"
              >
                Reset
              </button>
            </div>

            <GenerateResultPreview result={result} />

            <div className="mt-8 bg-base-charcoal rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white mb-0.5">
                  {isAuthenticated ? 'Save this project' : 'Want to save or export this?'}
                </p>
                <p className="text-xs text-white/45">
                  {isAuthenticated
                    ? 'Save it to your dashboard to export or keep track of it.'
                    : 'Create a free account — your generated project will be saved automatically.'}
                </p>
              </div>
              {isAuthenticated ? (
                <Button size="sm" loading={saving} onClick={handleSave} className="flex-shrink-0">
                  Save project →
                </Button>
              ) : (
                <div className="flex gap-2 flex-shrink-0">
                  <Link to="/login">
                    <Button size="sm" variant="secondary">Sign in</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign up free →</Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

