import axiosClient from './axiosClient'
import type { AddFeatureRequest, Project, ProjectCreate } from '@/types/api'

export const projectsApi = {
  list: () => axiosClient.get<Project[]>('/projects').then(r => r.data),
  create: (data: ProjectCreate) => axiosClient.post<Project>('/projects', data).then(r => r.data),
  get: (id: number) => axiosClient.get<Project>(`/projects/${id}`).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/projects/${id}`),
  addFeature: (id: number, data: AddFeatureRequest) =>
    axiosClient.post<Project>(`/projects/${id}/features`, data).then(r => r.data),
  exportMarkdown: (id: number) =>
    axiosClient.get(`/projects/${id}/export/markdown`, { responseType: 'blob' }),
  exportJson: (id: number) =>
    axiosClient.get(`/projects/${id}/export/json`, { responseType: 'blob' }),
  exportCsv: (id: number) =>
    axiosClient.get(`/projects/${id}/export/csv`, { responseType: 'blob' }),
}
