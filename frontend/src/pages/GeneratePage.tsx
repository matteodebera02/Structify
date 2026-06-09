import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import GenerateForm from '@/components/generate/GenerateForm'
import GenerateResultPreview from '@/components/home/GenerateResultPreview'
import RateLimitBanner from '@/components/generate/RateLimitBanner'
import { useGenerate } from '@/hooks/useGenerate'
import { useGenerateStore } from '@/store/generateStore'
import { useProjects } from '@/hooks/useProjects'
import type { OutputMode } from '@/types/models'

export default function GeneratePage() {
  const navigate = useNavigate()
  const { generate, result, description, mode, isLoading, error, rateLimit, reset } = useGenerate()
  const { createProject } = useProjects()
  const [saving, setSaving] = useState(false)

  // Auto-trigger if user came from the pre-auth flow with a saved description
  useEffect(() => {
    const { description: pending, mode: pendingMode, result: existing, isLoading: busy } =
      useGenerateStore.getState()
    if (pending && !existing && !busy) {
      generate({ description: pending, mode: pendingMode })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => { reset() }
  }, [reset])

  const handleGenerate = (desc: string, m: OutputMode) => {
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
      console.error('[generate] save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-pink-primary uppercase tracking-widest mb-2">
            New project
          </p>
          <h1 className="text-2xl font-semibold text-base-black tracking-tight mb-2">
            Describe your project
          </h1>
          <p className="text-sm text-base-muted">
            Write a brief description and Structify will generate user stories and tasks ready to execute.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-base-border rounded-2xl p-6 shadow-sm mb-6">
          <GenerateForm onGenerate={handleGenerate} loading={isLoading} />
        </div>

        {/* Loading */}
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

        {/* Rate limit */}
        {rateLimit && !isLoading && (
          <div className="mb-6">
            <RateLimitBanner waitTime={rateLimit} />
          </div>
        )}

        {/* Generic error */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Result */}
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
                <p className="text-sm font-semibold text-white mb-0.5">Save this project</p>
                <p className="text-xs text-white/45">
                  It will appear in your dashboard and you can export or track it.
                </p>
              </div>
              <Button size="sm" loading={saving} onClick={handleSave} className="flex-shrink-0">
                Save project →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
