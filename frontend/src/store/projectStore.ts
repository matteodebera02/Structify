import { create } from 'zustand'
import type { Project } from '@/types/models'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  removeProject: (id: number) => void
  updateProject: (project: Project) => void
}

export const useProjectStore = create<ProjectState>()((set) => ({
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  addProject: (project) => set((s) => ({ projects: [project, ...s.projects] })),
  removeProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),
  updateProject: (project) => set((s) => ({
    projects: s.projects.map(p => p.id === project.id ? project : p),
    currentProject: s.currentProject?.id === project.id ? project : s.currentProject,
  })),
}))
