import axiosClient from './axiosClient'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'

export const authApi = {
  register: (data: RegisterRequest) =>
    axiosClient.post<AuthResponse>('/auth/register', data).then(r => r.data),
  login: (data: LoginRequest) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then(r => r.data),
  forgotPassword: (email: string) =>
    axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    axiosClient.post('/auth/reset-password', { token, password }),
}
