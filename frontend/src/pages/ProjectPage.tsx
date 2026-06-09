import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { useProjects } from '@/hooks/useProjects'
import { useExport } from '@/hooks/useExport'
import { useProjectStore } from '@/store/projectStore'
import { tasksApi } from '@/api/tasksApi'
import type { Task, UserStory } from '@/types/models'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'
import type { OutputMode } from '@/types/models'

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchProject, deleteProject, addFeature } = useProjects()
  const { currentProject, updateProject } = useProjectStore()

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedUS, setExpandedUS] = useState<Set<number>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [addingFeature, setAddingFeature] = useState(false)
  const [featureDesc, setFeatureDesc] = useState('')
  const [featureMode, setFeatureMode] = useState<OutputMode>('us_and_tasks')
  const [savingFeature, setSavingFeature] = useState(false)
  const [featureError, setFeatureError] = useState<string | null>(null)
  const newContentRef = useRef<HTMLDivElement>(null)

  const projectId = Number(id)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setFetchError(null)
    fetchProject(projectId)
      .catch(() => setFetchError('Project not found'))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const project = currentProject?.id === projectId ? currentProject : null

  // Expand all user stories once project loads
  useEffect(() => {
    if (project?.user_stories?.length) {
      setExpandedUS(new Set(project.user_stories.map(us => us.id)))
    }
  }, [project?.id])

  const { exportMarkdown, exportJson, exportCsv } = useExport(projectId, project?.title ?? 'project')

  const completeTask = async (taskId: number) => {
    if (!project) return
    const updated = await tasksApi.complete(taskId)
    const tasks = project.tasks.map(t => t.id === taskId ? updated : t)
    const user_stories = project.user_stories.map(us => ({
      ...us,
      tasks: us.tasks.map(t => t.id === taskId ? updated : t),
    }))
    updateProject({ ...project, tasks, user_stories })
  }

  const handleDeleteProject = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeletingProject(true)
    try {
      await deleteProject(projectId)
      navigate('/dashboard')
    } catch {
      setDeletingProject(false)
      setConfirmDelete(false)
    }
  }

  const handleAddFeature = async () => {
    if (!featureDesc.trim() || !project) return
    setSavingFeature(true)
    setFeatureError(null)
    const prevUSIds = new Set(project.user_stories.map(us => us.id))
    try {
      const updated = await addFeature(projectId, { description: featureDesc, mode: featureMode })
      setFeatureDesc('')
      setAddingFeature(false)
      // Expand any newly added user stories
      const newUSIds = updated.user_stories
        .filter(us => !prevUSIds.has(us.id))
        .map(us => us.id)
      if (newUSIds.length > 0) {
        setExpandedUS(prev => new Set([...prev, ...newUSIds]))
      }
      // Scroll to new content
      setTimeout(() => {
        newContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch {
      setFeatureError('Generation failed. Check your connection and try again.')
    } finally {
      setSavingFeature(false)
    }
  }

  const toggleUS = (usId: number) => {
    setExpandedUS(prev => {
      const next = new Set(prev)
      if (next.has(usId)) next.delete(usId)
      else next.add(usId)
      return next
    })
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-pink-primary">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  /* ── Error / Not found ── */
  if (fetchError || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-sm text-base-muted">{fetchError ?? 'Project not found'}</p>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">← Back to dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  /* ── Derived data ── */
  const isUsMode = project.user_stories.length > 0
  const allTasks = [
    ...project.tasks.filter(t => t.user_story_id === null),
    ...project.user_stories.flatMap(us => us.tasks),
  ]
  const completedCount = allTasks.filter(t => t.completed).length
  const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 sm:px-6 sm:py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-base-muted mb-6">
          <Link to="/dashboard" className="hover:text-base-black transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-base-black font-medium truncate max-w-[240px]">{project.title}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-semibold text-base-black tracking-tight">{project.title}</h1>
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide flex-shrink-0',
                  isUsMode
                    ? 'bg-pink-soft text-pink-dark'
                    : 'bg-base-surface text-base-muted border border-base-border'
                )}>
                  {isUsMode ? 'US + Tasks' : 'Tasks only'}
                </span>
              </div>
              <p className="text-sm text-base-muted leading-relaxed">{project.description}</p>
            </div>

            {/* Delete — always visible top-right */}
            <button
              onClick={handleDeleteProject}
              disabled={deletingProject}
              onMouseLeave={() => !deletingProject && setConfirmDelete(false)}
              className={cn(
                'text-xs px-3 py-1.5 border rounded-md transition-colors flex-shrink-0',
                confirmDelete
                  ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                  : 'border-base-border text-base-muted hover:text-red-500 hover:border-red-200 bg-white'
              )}
            >
              {deletingProject ? '…' : confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
          </div>

          {/* Export buttons — full-width scrollable row on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
            <button
              onClick={exportMarkdown}
              className="text-xs px-3 py-1.5 border border-base-border rounded-md text-base-muted hover:text-base-black hover:border-[#ccc] transition-colors bg-white whitespace-nowrap flex-shrink-0"
            >
              ↓ Markdown
            </button>
            <button
              onClick={exportJson}
              className="text-xs px-3 py-1.5 border border-base-border rounded-md text-base-muted hover:text-base-black hover:border-[#ccc] transition-colors bg-white whitespace-nowrap flex-shrink-0"
            >
              ↓ JSON
            </button>
            <button
              onClick={exportCsv}
              className="text-xs px-3 py-1.5 border border-base-border rounded-md text-base-muted hover:text-base-black hover:border-[#ccc] transition-colors bg-white whitespace-nowrap flex-shrink-0"
            >
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {allTasks.length > 0 && (
          <div className="bg-base-surface rounded-xl p-4 mb-8 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-base-muted mb-1.5">
                <span>Overall progress</span>
                <span>{completedCount} / {allTasks.length} tasks</span>
              </div>
              <div className="h-1.5 bg-white rounded-full overflow-hidden border border-base-border">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    progress === 100 ? 'bg-green-500' : 'bg-pink-primary'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl font-semibold text-base-black">{progress}%</p>
              <p className="text-[10px] text-base-muted">complete</p>
            </div>
          </div>
        )}

        {/* User Stories */}
        {isUsMode && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-base-black">
                User Stories
                <span className="text-base-muted font-normal ml-1.5">({project.user_stories.length})</span>
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setExpandedUS(new Set(project.user_stories.map(us => us.id)))}
                  className="text-xs text-base-muted hover:text-base-black transition-colors"
                >
                  Expand all
                </button>
                <button
                  onClick={() => setExpandedUS(new Set())}
                  className="text-xs text-base-muted hover:text-base-black transition-colors"
                >
                  Collapse all
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {project.user_stories.map((us, idx) => (
                <UserStoryBlock
                  key={us.id}
                  us={us}
                  index={idx}
                  isExpanded={expandedUS.has(us.id)}
                  onToggle={() => toggleUS(us.id)}
                  onCompleteTask={completeTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Standalone / tasks-only tasks */}
        {(!isUsMode || project.tasks.length > 0) && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-base-black mb-4">
              {isUsMode ? 'Standalone Tasks' : 'Tasks'}
              <span className="text-base-muted font-normal ml-1.5">({project.tasks.length})</span>
            </h2>
            {project.tasks.length === 0 ? (
              <p className="text-xs text-base-muted py-4">No standalone tasks.</p>
            ) : (
              <div className="border border-base-border rounded-xl overflow-hidden divide-y divide-base-border">
                {project.tasks.map(task => (
                  <TaskItem key={task.id} task={task} onComplete={() => completeTask(task.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scroll anchor — new content appears above this */}
        <div ref={newContentRef} />

        {/* Add Feature */}
        <div className={cn(
          'border rounded-xl transition-all duration-200 mb-8',
          addingFeature ? 'border-pink-primary/30' : 'border-dashed border-base-border'
        )}>
          {!addingFeature ? (
            <button
              onClick={() => setAddingFeature(true)}
              className="w-full py-5 text-sm text-base-muted hover:text-pink-primary transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-base font-light">+</span>
              Add a feature
            </button>
          ) : savingFeature ? (
            /* Loading state — replaces the form while AI is working */
            <div className="p-8 flex flex-col items-center gap-4">
              <div className="text-pink-primary">
                <Spinner size="lg" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-base-black mb-1">Generating new feature</p>
                <p className="text-xs text-base-muted">The AI is building the new user stories and tasks — this takes a few seconds.</p>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <p className="text-sm font-semibold text-base-black mb-0.5">Add a feature</p>
              <p className="text-xs text-base-muted mb-4">
                Describe what to add — the AI will generate new user stories and tasks and append them.
              </p>
              <textarea
                value={featureDesc}
                onChange={e => setFeatureDesc(e.target.value)}
                placeholder="Describe the new feature..."
                rows={3}
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-base-border rounded-lg bg-white outline-none focus:border-pink-primary transition-colors resize-none mb-3 font-sans placeholder:text-base-muted"
              />
              {featureError && (
                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-red-600">{featureError}</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-1 bg-base-surface border border-base-border rounded-md p-1 self-start">
                  {(['us_and_tasks', 'tasks_only'] as OutputMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setFeatureMode(m)}
                      className={cn(
                        'text-xs px-3 py-1 rounded transition-colors',
                        featureMode === m ? 'bg-pink-primary text-white' : 'text-base-muted hover:text-base-black'
                      )}
                    >
                      {m === 'us_and_tasks' ? 'US + Tasks' : 'Tasks only'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAddingFeature(false); setFeatureDesc(''); setFeatureError(null) }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!featureDesc.trim()}
                    onClick={handleAddFeature}
                  >
                    Generate & add →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-base-border flex items-center justify-between">
          <p className="text-[11px] text-base-muted">Created {formatDate(project.created_at)}</p>
          <p className="text-[11px] text-base-muted">Updated {formatDate(project.updated_at)}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── User Story accordion block ─── */
function UserStoryBlock({
  us, index, isExpanded, onToggle, onCompleteTask,
}: {
  us: UserStory
  index: number
  isExpanded: boolean
  onToggle: () => void
  onCompleteTask: (taskId: number) => void
}) {
  const completedCount = us.tasks.filter(t => t.completed).length

  return (
    <div className="border border-base-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-base-surface/50 transition-colors"
      >
        <span className="w-6 h-6 rounded-md bg-pink-soft text-pink-dark text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-base-black truncate">{us.title}</p>
          {!isExpanded && (
            <p className="text-xs text-base-muted truncate mt-0.5">{us.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-base-muted hidden xs:inline">{completedCount}/{us.tasks.length} done</span>
          <span className="text-[10px] text-base-muted xs:hidden">{completedCount}/{us.tasks.length}</span>
          <span
            className="text-base-muted text-xs transition-transform duration-200 inline-block"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ↓
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-base-border">
          <p className="px-4 py-3 text-xs text-base-muted border-b border-base-border bg-base-surface/30 leading-relaxed">
            {us.description}
          </p>
          {us.tasks.length === 0 ? (
            <p className="px-4 py-4 text-xs text-base-muted italic">No tasks in this user story.</p>
          ) : (
            <div className="divide-y divide-base-border">
              {us.tasks.map(task => (
                <TaskItem key={task.id} task={task} onComplete={() => onCompleteTask(task.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Task item row ─── */
const EFFORT_STYLES: Record<string, string> = {
  S: 'text-green-600 bg-green-50 border-green-100',
  M: 'text-amber-600 bg-amber-50 border-amber-100',
  L: 'text-red-500 bg-red-50 border-red-100',
}

function TaskItem({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const [completing, setCompleting] = useState(false)

  const handleComplete = async () => {
    if (completing) return
    setCompleting(true)
    try {
      await onComplete()
    } finally {
      setCompleting(false)
    }
  }

  const effortStyle = EFFORT_STYLES[task.effort] ?? 'text-base-muted bg-base-surface border-base-border'

  return (
    <div className="flex items-start gap-3 px-3 sm:px-4 py-3 group hover:bg-base-surface/30 transition-colors">
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={completing}
        className={cn(
          'mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all',
          task.completed
            ? 'bg-pink-primary border-pink-primary'
            : 'border-base-border hover:border-pink-primary bg-white',
          completing && 'opacity-50 cursor-not-allowed'
        )}
      >
        {task.completed && (
          <svg viewBox="0 0 10 8" fill="none" className="w-2.5 h-2.5">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className={cn(
            'text-sm font-medium transition-colors',
            task.completed ? 'text-base-muted line-through' : 'text-base-black'
          )}>
            {task.title}
          </span>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0',
            effortStyle
          )}>
            {task.effort}
            {task.effort_hours && ` · ${task.effort_hours.min}–${task.effort_hours.max}h`}
          </span>
        </div>

        {task.description && (
          <p className="text-xs text-base-muted leading-relaxed">{task.description}</p>
        )}

        {task.assumptions && task.assumptions.length > 0 && (
          <p className="text-[10px] text-base-muted/70 mt-1 italic">
            Assumes: {task.assumptions.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
