import axiosClient from './axiosClient'
import type { GenerateRequest, GenerateResponse } from '@/types/api'

export interface QuotaInfo {
  own_key: boolean
  limit: number | null
  used: number | null
  remaining: number | null
}

export const generateApi = {
  generate: (data: GenerateRequest) =>
    axiosClient.post<GenerateResponse>('/generate', data).then(r => r.data),
  getQuota: () =>
    axiosClient.get<QuotaInfo>('/generate/quota').then(r => r.data),
}
