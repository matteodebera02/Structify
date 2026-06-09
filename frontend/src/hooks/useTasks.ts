import { tasksApi } from '@/api/tasksApi'
import { useProjectStore } from '@/store/projectStore'
import type { TaskUpdate } from '@/types/api'

export function useTasks() {
  const { currentProject, updateProject } = useProjectStore()

  const patchProject = (taskId: number, updatedTask: Parameters<typeof updateProject>[0]['tasks'][0]) => {
    if (!currentProject) return
    const tasks = currentProject.tasks.map(t => t.id === taskId ? updatedTask : t)
    const user_stories = currentProject.user_stories.map(us => ({
      ...us,
      tasks: us.tasks.map(t => t.id === taskId ? updatedTask : t),
    }))
    updateProject({ ...currentProject, tasks, user_stories })
  }

  const updateTask = async (id: number, data: TaskUpdate) => {
    const updated = await tasksApi.update(id, data)
    patchProject(id, updated)
  }

  const completeTask = async (id: number) => {
    const updated = await tasksApi.complete(id)
    patchProject(id, updated)
  }

  return { updateTask, completeTask }
}
