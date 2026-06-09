import { useState } from 'react'
import type { Project } from '@/types/models'
import { relativeDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'

interface Props {
  project: Project
  onClick: () => void
  onDelete: () => void
  deleting?: boolean
}

function getProjectTasks(p: Project) {
  const orphans = p.tasks.filter(t => t.user_story_id === null)
  const nested = p.user_stories.flatMap(us => us.tasks)
  return [...orphans, ...nested]
}

export default function ProjectCard({ project, onClick, onDelete, deleting }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isUsMode = project.user_stories.length > 0
  const allTasks = getProjectTasks(project)
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(t => t.completed).length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const isDone = totalTasks > 0 && completedTasks === totalTasks

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete()
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <div
      onClick={onClick}
      onMouseLeave={() => setConfirmDelete(false)}
      className={cn(
        'group relative border border-base-border rounded-xl p-4 pl-5 cursor-pointer overflow-hidden',
        'hover:border-[#ccc] hover:shadow-sm transition-all duration-150 bg-white'
      )}
    >
      {/* Left accent bar */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl',
        isUsMode ? 'bg-pink-primary' : 'bg-base-charcoal'
      )} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-semibold text-base-black truncate flex-1 leading-snug">
          {project.title}
        </h3>
        <button
          onClick={handleDeleteClick}
          disabled={deleting}
          className={cn(
            'flex-shrink-0 text-[11px] px-2 py-0.5 rounded transition-all duration-150 leading-none',
            confirmDelete
              ? 'bg-red-50 text-red-500 border border-red-200 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-base-muted hover:text-red-500'
          )}
        >
          {deleting ? '…' : confirmDelete ? 'Confirm' : '✕'}
        </button>
      </div>

      {/* Description */}
      <p className="text-[11px] text-base-muted leading-relaxed mb-3 line-clamp-2">
        {project.description}
      </p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-base-muted mb-1">
          <span>Progress</span>
          <span>{completedTasks}/{totalTasks} tasks</span>
        </div>
        <div className="h-[3px] bg-base-surface rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isDone ? 'bg-green-500' : progress > 0 ? 'bg-pink-primary' : 'bg-pink-primary/30'
            )}
            style={{ width: progress > 0 ? `${progress}%` : '0%' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded font-medium',
            isUsMode
              ? 'bg-pink-soft text-pink-dark'
              : 'bg-base-surface text-base-muted border border-base-border'
          )}>
            {isUsMode ? 'US + Tasks' : 'Tasks only'}
          </span>
          {isUsMode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-base-surface text-base-muted border border-base-border">
              {project.user_stories.length} {project.user_stories.length === 1 ? 'story' : 'stories'}
            </span>
          )}
          {isDone && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 font-medium">
              Done
            </span>
          )}
        </div>
        <span className="text-[10px] text-base-muted flex-shrink-0 ml-2">
          {relativeDate(project.updated_at)}
        </span>
      </div>
    </div>
  )
}
