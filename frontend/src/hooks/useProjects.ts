import { useState } from 'react'
import { projectsApi } from '@/api/projectsApi'
import { useProjectStore } from '@/store/projectStore'
import type { AddFeatureRequest, ProjectCreate } from '@/types/api'

export function useProjects() {
  const store = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await projectsApi.list()
      store.setProjects(data)
    } catch (err) {
      console.error('[projects] fetch failed', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (data: ProjectCreate) => {
    const project = await projectsApi.create(data)
    console.log('[projects] created id=%d', project.id)
    store.addProject(project)
    return project
  }

  const fetchProject = async (id: number) => {
    const project = await projectsApi.get(id)
    store.setCurrentProject(project)
    return project
  }

  const deleteProject = async (id: number) => {
    await projectsApi.delete(id)
    store.removeProject(id)
  }

  const addFeature = async (id: number, data: AddFeatureRequest) => {
    const project = await projectsApi.addFeature(id, data)
    store.updateProject(project)
    return project
  }

  return { ...store, loading, error, fetchProjects, createProject, fetchProject, deleteProject, addFeature }
}
