import axiosClient from './axiosClient'
import type { GenerateRequest, GenerateResponse } from '@/types/api'

export const generateApi = {
  generate: (data: GenerateRequest) =>
    axiosClient.post<GenerateResponse>('/generate', data).then(r => r.data),
}
