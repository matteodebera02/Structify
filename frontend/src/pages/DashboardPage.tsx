import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ProjectCard from '@/components/dashboard/ProjectCard'
import StatCard from '@/components/dashboard/StatCard'
import { useProjects } from '@/hooks/useProjects'
import { useGenerateStore } from '@/store/generateStore'
import { useAuthStore } from '@/store/authStore'
import type { Project } from '@/types/models'
import { cn } from '@/utils/cn'

type WorkspaceFilter = 'all' | 'recent' | 'completed'
type ModeFilter = 'all' | 'us_and_tasks' | 'tasks_only'
type SortBy = 'updated' | 'created' | 'name'

function getProjectTasks(p: Project) {
  const orphans = p.tasks.filter(t => t.user_story_id === null)
  const nested = p.user_stories.flatMap(us => us.tasks)
  return [...orphans, ...nested]
}

function getUserInitials(email: string): string {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/)
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const WORKSPACE_ITEMS: { label: string; value: WorkspaceFilter; icon: string }[] = [
  { label: 'All projects', value: 'all', icon: '▦' },
  { label: 'Recent', value: 'recent', icon: '◷' },
  { label: 'Completed', value: 'completed', icon: '✓' },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { result, description, mode: generateMode, reset } = useGenerateStore()
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjects()

  const [saving, setSaving] = useState(false)
  const [workspaceFilter, setWorkspaceFilter] = useState<WorkspaceFilter>('all')
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('updated')
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchProjects() }, [])

  const hasPendingResult = !!(result && description)

  const totalTasks = useMemo(
    () => projects.reduce((sum, p) => sum + getProjectTasks(p).length, 0),
    [projects]
  )

  const completedTasks = useMemo(
    () => projects.reduce((sum, p) => sum + getProjectTasks(p).filter(t => t.completed).length, 0),
    [projects]
  )

  const avgEffort = useMemo(() => {
    const effortMap: Record<string, number> = { S: 1.5, M: 4, L: 10 }
    const all = projects.flatMap(getProjectTasks)
    if (!all.length) return '—'
    const avg = all.reduce((sum, t) => sum + (effortMap[t.effort] ?? 4), 0) / all.length
    return `${avg.toFixed(1)}h`
  }, [projects])

  const filtered = useMemo(() => {
    let list = [...projects]

    if (workspaceFilter === 'recent') {
      const week = Date.now() - 7 * 86400000
      list = list.filter(p => new Date(p.updated_at).getTime() > week)
    } else if (workspaceFilter === 'completed') {
      list = list.filter(p => {
        const tasks = getProjectTasks(p)
        return tasks.length > 0 && tasks.every(t => t.completed)
      })
    }

    if (modeFilter === 'us_and_tasks') {
      list = list.filter(p => p.user_stories.length > 0)
    } else if (modeFilter === 'tasks_only') {
      list = list.filter(p => p.user_stories.length === 0)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    }

    list.sort((a, b) => {
      let cmp = 0
      if (sortBy === 'updated') cmp = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      else if (sortBy === 'created') cmp = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      else if (sortBy === 'name') cmp = a.title.localeCompare(b.title)
      return sortAsc ? -cmp : cmp
    })

    return list
  }, [projects, workspaceFilter, modeFilter, search, sortBy, sortAsc])

  const handleSavePending = async () => {
    if (!result || !description) return
    setSaving(true)
    try {
      const project = await createProject({
        title: result.project_title || 'Untitled project',
        description,
        mode: generateMode,
        generated: result,
      })
      reset()
      navigate(`/projects/${project.id}`)
    } catch {
      console.error('[dashboard] save pending failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await deleteProject(id)
    } finally {
      setDeletingId(null)
    }
  }

  const initials = user?.email ? getUserInitials(user.email) : '??'
  const username = user?.email?.split('@')[0] ?? ''

  const sectionLabel =
    workspaceFilter === 'recent' ? 'Recent' :
    workspaceFilter === 'completed' ? 'Completed' : 'All projects'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-[220px] bg-white border-r border-base-border flex-col md:hidden',
        'transition-transform duration-200 ease-in-out',
        mobileMenuOpen ? 'flex translate-x-0' : 'hidden -translate-x-full'
      )}>
        <div className="p-3 pt-4">
          <button
            onClick={() => { navigate('/generate'); setMobileMenuOpen(false) }}
            className="w-full flex items-center justify-center gap-2 bg-pink-primary hover:bg-pink-hover text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            New project
          </button>
        </div>
        <div className="px-3 pt-3">
          <p className="text-[10px] text-base-muted uppercase tracking-widest px-2 mb-2 font-medium">Workspace</p>
          {WORKSPACE_ITEMS.map(item => (
            <button
              key={item.value}
              onClick={() => { setWorkspaceFilter(item.value); setMobileMenuOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] mb-0.5 transition-colors text-left',
                workspaceFilter === item.value
                  ? 'bg-pink-soft text-pink-dark font-medium'
                  : 'text-base-muted hover:bg-base-surface hover:text-base-black'
              )}
            >
              <span className="text-xs w-3.5 text-center">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-auto border-t border-base-border">
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => { navigate('/settings'); setMobileMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] text-base-muted hover:bg-base-surface hover:text-base-black transition-colors text-left"
            >
              <span className="text-xs w-3.5 text-center">⚙</span>
              Settings
            </button>
          </div>
          <div className="p-3 pt-1">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <div className="w-7 h-7 rounded-full bg-pink-soft flex items-center justify-center text-[11px] font-bold text-pink-dark flex-shrink-0">
                {initials}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs text-base-black font-medium truncate">{username}</p>
                <p className="text-[10px] text-base-muted truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col w-[220px] border-r border-base-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] flex-shrink-0 overflow-y-auto">

          {/* New project */}
          <div className="p-3 pt-4">
            <button
              onClick={() => navigate('/generate')}
              className="w-full flex items-center justify-center gap-2 bg-pink-primary hover:bg-pink-hover text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              <span className="text-lg leading-none">+</span>
              New project
            </button>
          </div>

          {/* Workspace nav */}
          <div className="px-3 pt-3">
            <p className="text-[10px] text-base-muted uppercase tracking-widest px-2 mb-2 font-medium">
              Workspace
            </p>
            {WORKSPACE_ITEMS.map(item => (
              <button
                key={item.value}
                onClick={() => setWorkspaceFilter(item.value)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] mb-0.5 transition-colors text-left',
                  workspaceFilter === item.value
                    ? 'bg-pink-soft text-pink-dark font-medium'
                    : 'text-base-muted hover:bg-base-surface hover:text-base-black'
                )}
              >
                <span className="text-xs w-3.5 text-center">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Settings + user info */}
          <div className="mt-auto border-t border-base-border">
            <div className="px-3 pt-3 pb-1">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-[13px] text-base-muted hover:bg-base-surface hover:text-base-black transition-colors text-left"
              >
                <span className="text-xs w-3.5 text-center">⚙</span>
                Settings
              </button>
            </div>
            <div className="p-3 pt-1">
              <div className="flex items-center gap-2.5 px-2 py-2">
                <div className="w-7 h-7 rounded-full bg-pink-soft flex items-center justify-center text-[11px] font-bold text-pink-dark flex-shrink-0">
                  {initials}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs text-base-black font-medium truncate">{username}</p>
                  <p className="text-[10px] text-base-muted truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 max-w-5xl">

            {/* Pending result banner */}
            {hasPendingResult && (
              <div className="mb-8 bg-pink-soft border border-pink-primary/20 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-pink-primary mb-0.5">
                    Unsaved generated project
                  </p>
                  <p className="text-xs text-base-muted">
                    "{result!.project_title || description.slice(0, 60)}" — save it to keep it.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="ghost" onClick={reset}>Discard</Button>
                  <Button size="sm" loading={saving} onClick={handleSavePending}>
                    Save project →
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile menu trigger */}
            <div className="md:hidden flex items-center gap-3 mb-6">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center gap-2 text-sm text-base-muted hover:text-base-black transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Menu
              </button>
              <button
                onClick={() => navigate('/generate')}
                className="ml-auto flex items-center gap-1.5 bg-pink-primary hover:bg-pink-hover text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
              >
                + New project
              </button>
            </div>

            {/* Page header */}
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h1 className="text-lg font-semibold text-base-black tracking-tight">
                  Your projects
                </h1>
                <p className="text-xs text-base-muted mt-0.5">
                  {projects.length} project{projects.length !== 1 ? 's' : ''} · {totalTasks} tasks generated
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="text-xs pl-3 pr-7 py-1.5 border border-base-border rounded-md bg-base-surface outline-none focus:border-pink-primary focus:bg-white transition-colors placeholder:text-base-muted w-36"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-base-muted hover:text-base-black"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Mode filter */}
                {(['all', 'us_and_tasks', 'tasks_only'] as ModeFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setModeFilter(f)}
                    className={cn(
                      'text-[12px] px-2.5 py-1.5 rounded-md border transition-colors',
                      modeFilter === f
                        ? 'border-pink-primary bg-pink-soft text-pink-dark font-medium'
                        : 'border-base-border text-base-muted hover:text-base-black bg-white'
                    )}
                  >
                    {f === 'all' ? 'All' : f === 'us_and_tasks' ? 'US + Tasks' : 'Task only'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <StatCard label="Projects" value={projects.length} subText="in workspace" />
              <StatCard
                label="Tasks generated"
                value={totalTasks}
                highlight={completedTasks > 0 ? String(completedTasks) : undefined}
                subText={completedTasks > 0 ? 'completed' : 'none completed yet'}
              />
              <StatCard label="Avg. effort" value={avgEffort} subText="per task" />
            </div>

            {/* Projects grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24 text-pink-primary">
                <Spinner size="lg" />
              </div>
            ) : projects.length === 0 ? (
              /* Empty state */
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-2xl bg-base-surface flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl text-base-muted">✦</span>
                </div>
                <p className="text-sm font-semibold text-base-black mb-1.5">No projects yet</p>
                <p className="text-xs text-base-muted mb-6 max-w-xs mx-auto">
                  Describe a project idea and Structify will generate user stories and tasks in seconds.
                </p>
                <Button size="sm" onClick={() => navigate('/generate')}>
                  Generate your first project →
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              /* No results */
              <div className="text-center py-20">
                <p className="text-sm text-base-muted mb-2">No projects match your filters.</p>
                <button
                  onClick={() => { setSearch(''); setModeFilter('all'); setWorkspaceFilter('all') }}
                  className="text-xs text-pink-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-base-black">
                    {sectionLabel}
                    {filtered.length !== projects.length && (
                      <span className="text-base-muted font-normal ml-1">({filtered.length})</span>
                    )}
                  </p>
                  <div className="flex items-center gap-1">
                    {(['updated', 'created', 'name'] as SortBy[]).map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          if (sortBy === s) setSortAsc(a => !a)
                          else { setSortBy(s); setSortAsc(false) }
                        }}
                        className={cn(
                          'text-[11px] px-2 py-1 rounded transition-colors',
                          sortBy === s
                            ? 'text-pink-dark font-medium'
                            : 'text-base-muted hover:text-base-black'
                        )}
                      >
                        {s === 'updated' ? 'Updated' : s === 'created' ? 'Created' : 'Name'}
                        {sortBy === s && <span className="ml-0.5">{sortAsc ? '↑' : '↓'}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      onDelete={() => handleDelete(project.id)}
                      deleting={deletingId === project.id}
                    />
                  ))}

                  {/* New project card */}
                  <button
                    onClick={() => navigate('/generate')}
                    className="group border-[1.5px] border-dashed border-base-border rounded-xl flex flex-col items-center justify-center gap-2 min-h-[160px] hover:border-pink-primary hover:bg-pink-soft/30 transition-all duration-150"
                  >
                    <span className="text-2xl text-base-muted group-hover:text-pink-primary transition-colors">✦</span>
                    <p className="text-xs text-base-muted group-hover:text-pink-dark transition-colors">
                      Describe a new project
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
