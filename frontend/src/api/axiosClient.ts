import axios from 'axios'
import { storage } from '@/utils/storage'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log(`[api] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

axiosClient.interceptors.response.use(
  (res) => {
    console.log(`[api] ${res.status} ${res.config.url}`)
    return res
  },
  (err) => {
    console.error(`[api] ${err.response?.status ?? 'ERR'} ${err.config?.url}`, err.response?.data)
    if (err.response?.status === 401) {
      storage.removeToken()
      // also clear zustand auth state so isAuthenticated goes false
      import('@/store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout()
      })
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default axiosClient
