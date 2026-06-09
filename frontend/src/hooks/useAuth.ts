import { useNavigate } from 'react-router-dom'
import { authApi } from '@/api/authApi'
import { projectsApi } from '@/api/projectsApi'
import { useAuthStore } from '@/store/authStore'
import { useGenerateStore } from '@/store/generateStore'
import type { LoginRequest, RegisterRequest } from '@/types/api'

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore()
  const navigate = useNavigate()

  const redirectAfterAuth = async () => {
    const { result, description, mode, reset } = useGenerateStore.getState()

    if (result && description) {
      // Already generated before login — save it directly
      try {
        const project = await projectsApi.create({
          title: result.project_title || 'Untitled project',
          description,
          mode,
          generated: result,
        })
        reset()
        navigate(`/projects/${project.id}`)
        return
      } catch {
        // fall through to dashboard with banner
      }
    } else if (description && !result) {
      // Description saved pre-auth but not yet generated — trigger generation on /generate
      navigate('/generate')
      return
    }

    navigate('/dashboard')
  }

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data)
    setAuth(res.user, res.access_token)
    await redirectAfterAuth()
  }

  const register = async (data: RegisterRequest) => {
    const res = await authApi.register(data)
    setAuth(res.user, res.access_token)
    await redirectAfterAuth()
  }

  const logoutAndRedirect = () => {
    logout()
    navigate('/')
  }

  return { user, isAuthenticated, login, register, logout: logoutAndRedirect }
}
