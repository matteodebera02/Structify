import axiosClient from './axiosClient'
import type { Task, TaskUpdate } from '@/types/api'

export const tasksApi = {
  update: (id: number, data: TaskUpdate) =>
    axiosClient.patch<Task>(`/tasks/${id}`, data).then(r => r.data),
  complete: (id: number) =>
    axiosClient.patch<Task>(`/tasks/${id}/complete`).then(r => r.data),
  reorder: (id: number, order: number) =>
    axiosClient.patch<Task>(`/tasks/${id}`, { order }).then(r => r.data),
}
