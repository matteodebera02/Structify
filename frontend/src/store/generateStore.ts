import { create } from 'zustand'
import type { GenerateResponse } from '@/types/api'
import type { OutputMode } from '@/types/models'

interface GenerateState {
  result: GenerateResponse | null
  mode: OutputMode
  description: string
  isLoading: boolean
  error: string | null
  rateLimit: string | null  // wait time string when 429, e.g. "25m19s"
  setResult: (result: GenerateResponse) => void
  setMode: (mode: OutputMode) => void
  setDescription: (description: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setRateLimit: (waitTime: string | null) => void
  reset: () => void
}

export const useGenerateStore = create<GenerateState>()((set) => ({
  result: null,
  mode: 'us_and_tasks',
  description: '',
  isLoading: false,
  error: null,
  rateLimit: null,
  setResult: (result) => set({ result }),
  setMode: (mode) => set({ mode }),
  setDescription: (description) => set({ description }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setRateLimit: (rateLimit) => set({ rateLimit }),
  reset: () => set({ result: null, error: null, rateLimit: null, description: '' }),
}))
