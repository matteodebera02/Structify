import axios from 'axios'
import { generateApi } from '@/api/generateApi'
import { useGenerateStore } from '@/store/generateStore'
import type { GenerateRequest } from '@/types/api'

export function useGenerate() {
  const store = useGenerateStore()

  const generate = async (data: GenerateRequest) => {
    store.setLoading(true)
    store.setError(null)
    store.setRateLimit(null)
    store.setDescription(data.description)
    store.setMode(data.mode)
    try {
      const result = await generateApi.generate(data)
      console.log('[generate] ok title=%s cache=%s latency=%dms',
        result.project_title, result.meta?.cache_hit, result.meta?.generation_time_ms)
      store.setResult(result)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const detail: string = err.response?.data?.detail ?? ''

        if (status === 429 && detail.startsWith('RATE_LIMIT::')) {
          const waitTime = detail.replace('RATE_LIMIT::', '')
          store.setRateLimit(waitTime)
        } else {
          store.setError(detail || 'Generation failed. Please try again.')
        }
      } else {
        store.setError('Generation failed. Please try again.')
      }
    } finally {
      store.setLoading(false)
    }
  }

  return { ...store, generate }
}
