import type { EffortHours, EffortSize, OutputMode, Project, Task, User, UserStory } from './models'

export interface RegisterRequest { email: string; password: string }
export interface LoginRequest { email: string; password: string }
export interface AuthResponse { access_token: string; token_type: string; user: User }
export interface GenerateRequest { description: string; mode: OutputMode }

export interface GeneratedTask {
  id: string
  user_story_id: string
  title: string
  description: string
  order: number
  effort: EffortSize
  effort_hours: EffortHours
  confidence: number
  assumptions: string[]
}

export interface GeneratedUserStory {
  id: string
  title: string
  description: string
  order: number
  tasks: GeneratedTask[]
}

export interface GenerateMeta {
  generation_time_ms: number
  cache_hit: boolean
  model: string
}

export interface GenerateResponse {
  project_title: string
  project_summary: string
  mode: OutputMode
  user_stories: GeneratedUserStory[]
  tasks: GeneratedTask[]
  warnings: string[]
  assumptions_required: string[]
  meta: GenerateMeta
}

export interface ProjectCreate { title: string; description: string; mode: OutputMode; generated?: GenerateResponse }

export interface UserSettings {
  id: number
  email: string
  has_groq_key: boolean
  groq_key_preview: string | null
}
export interface AddFeatureRequest { description: string; mode: OutputMode }
export interface TaskUpdate { title?: string; description?: string }
export type { Project, Task, User, UserStory }
