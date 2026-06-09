import axiosClient from './axiosClient'
import type { UserSettings } from '@/types/api'

export const settingsApi = {
  getMe: () => axiosClient.get<UserSettings>('/auth/users/me').then(r => r.data),
  updateGroqKey: (groq_api_key: string) =>
    axiosClient.patch<UserSettings>('/auth/users/me', { groq_api_key }).then(r => r.data),
  deleteAccount: () => axiosClient.delete('/auth/users/me'),
}
