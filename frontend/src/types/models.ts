export interface User {
  id: number
  email: string
  created_at: string
}

export type EffortSize = 'S' | 'M' | 'L'

export interface EffortHours {
  min: number
  max: number
}

export interface Task {
  id: number
  project_id: number
  user_story_id: number | null
  title: string
  description: string
  order: number
  effort: EffortSize
  effort_hours?: EffortHours
  confidence?: number
  assumptions?: string[]
  completed: boolean
  created_at: string
}

export interface UserStory {
  id: number
  project_id: number
  title: string
  description: string
  order: number
  tasks: Task[]
  created_at: string
}

export interface Project {
  id: number
  user_id: number
  title: string
  description: string
  user_stories: UserStory[]
  tasks: Task[]
  created_at: string
  updated_at: string
}

export type OutputMode = 'tasks_only' | 'us_and_tasks'
