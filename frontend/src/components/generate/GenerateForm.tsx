import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { OutputMode } from '@/types/models'

interface Props {
  onGenerate: (description: string, mode: OutputMode) => void
  loading: boolean
}

export default function GenerateForm({ onGenerate, loading }: Props) {
  const [description, setDescription] = useState('')
  const [mode, setMode] = useState<OutputMode>('us_and_tasks')

  // Metod to handle form submission at the fathers
  const handleSubmit = () => {
    if (!description.trim()) return
    onGenerate(description, mode)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the software or tech product you want to build — app, API, module, platform, integration..."
          rows={5}
          className="w-full px-4 py-3 text-sm bg-base-surface border border-base-border rounded-lg outline-none placeholder:text-base-muted focus:border-pink-primary transition-colors resize-none font-sans"
        />
        <p className="text-[11px] text-base-muted">
          Structify generates plans for software and technology projects. The more context you give (stack, team, scope), the more specific the output.
        </p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-base-surface border border-base-border rounded-md p-1">
          {(['us_and_tasks', 'tasks_only'] as OutputMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
                mode === m
                  ? 'bg-pink-primary text-white'
                  : 'text-base-muted hover:text-base-black'
              }`}
            >
              {m === 'us_and_tasks' ? 'US + Tasks' : 'Tasks only'}
            </button>
          ))}
        </div>
        <Button onClick={handleSubmit} loading={loading} disabled={!description.trim()}>
          Generate →
        </Button>
      </div>
    </div>
  )
}
