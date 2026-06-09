import type { GenerateResponse } from '@/types/api'
import TaskCard from '@/components/tasks/TaskCard'

interface Props {
  result: GenerateResponse
}

export default function GenerateResultPreview({ result }: Props) {
  const hasStories = result.user_stories.length > 0

  return (
    <div className="space-y-4">
      {/* Project header */}
      {(result.project_title || result.project_summary) && (
        <div className="bg-white border border-base-border rounded-2xl px-5 py-4 shadow-sm">
          {result.project_title && (
            <h2 className="text-base font-semibold text-base-black mb-1">{result.project_title}</h2>
          )}
          {result.project_summary && (
            <p className="text-xs text-base-muted leading-relaxed">{result.project_summary}</p>
          )}
          {result.meta && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-base-muted">
                {result.meta.model}
              </span>
              <span className="text-[10px] text-base-muted">
                {result.meta.generation_time_ms}ms
              </span>
              {result.meta.cache_hit && (
                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  cached
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Warnings</p>
          <ul className="space-y-0.5">
            {result.warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700">· {w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Assumptions required */}
      {result.assumptions_required && result.assumptions_required.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-blue-700 mb-1">Assumptions to clarify</p>
          <ul className="space-y-0.5">
            {result.assumptions_required.map((a, i) => (
              <li key={i} className="text-xs text-blue-700">· {a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* US + Tasks mode */}
      {hasStories && result.user_stories.map((story, i) => (
        <div
          key={i}
          className="bg-white border border-base-border rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="border-l-[3px] border-pink-primary px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-sm font-semibold text-base-black leading-snug">{story.title}</h3>
              <span className="flex-shrink-0 text-[11px] font-medium bg-pink-soft text-pink-primary px-2.5 py-0.5 rounded-full">
                {story.tasks.length} {story.tasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            {story.description && (
              <p className="text-xs text-base-muted leading-relaxed">{story.description}</p>
            )}
          </div>
          <div className="px-4 pb-4 space-y-2">
            {story.tasks.map((task, j) => (
              <TaskCard
                key={j}
                title={task.title}
                description={task.description}
                effort={task.effort}
                effort_hours={task.effort_hours}
                confidence={task.confidence}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Tasks-only mode */}
      {!hasStories && result.tasks.length > 0 && (
        <div className="bg-white border border-base-border rounded-2xl p-4 shadow-sm space-y-2">
          {result.tasks.map((task, i) => (
            <TaskCard
              key={i}
              title={task.title}
              description={task.description}
              effort={task.effort}
              effort_hours={task.effort_hours}
              confidence={task.confidence}
            />
          ))}
        </div>
      )}
    </div>
  )
}
