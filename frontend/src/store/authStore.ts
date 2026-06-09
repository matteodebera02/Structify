import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/models'
import { storage } from '@/utils/storage'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        storage.setToken(token)
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        storage.removeToken()
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'structify-auth' }
  )
)
