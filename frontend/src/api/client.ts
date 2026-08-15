import axios from 'axios'

const API_BASE = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Telegram init data to every request
api.interceptors.request.use((config) => {
  const initData = window.Telegram?.WebApp?.initData
  if (initData) {
    config.headers['X-Telegram-Init-Data'] = initData
  }
  return config
})

// --- Types ---
export interface GameProgress {
  score: number
  level: number
  stars: number
  achievements: Achievement[]
  comboHighScore: number
  totalTaps: number
  powerUps: PowerUp[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export interface PowerUp {
  id: string
  name: string
  multiplier: number
  duration: number
  cost: number
  icon: string
  active?: boolean
  expiresAt?: number
}

export interface LeaderboardEntry {
  rank: number
  userId: number
  username: string
  firstName: string
  score: number
  level: number
  avatar?: string
}

export interface SearchResult {
  id: string
  title: string
  description: string
  type: string
  url?: string
  date?: string
}

export interface UserProfile {
  userId: number
  username?: string
  firstName: string
  lastName?: string
  isPremium?: boolean
  score: number
  level: number
  stars: number
  achievements: Achievement[]
  joinedAt: string
  avatar?: string
}

export interface ShopItem {
  id: string
  name: string
  description: string
  type: 'power_up' | 'stars' | 'cosmetic'
  price: number
  icon: string
  value: number
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  icon: string
}

// --- API Functions ---
export const gameApi = {
  getProgress: () => api.get<GameProgress>('/game/progress'),
  saveProgress: (data: Partial<GameProgress>) => api.post('/game/save', data),
  getLeaderboard: (limit = 50) => api.get<LeaderboardEntry[]>(`/game/leaderboard?limit=${limit}`),
}

export const searchApi = {
  search: (query: string, filters?: { type?: string; date?: string }) =>
    api.get<{ results: SearchResult[] }>('/search', { params: { q: query, ...filters } }),
  getSuggestions: (query: string) =>
    api.get<{ suggestions: string[] }>('/search/suggestions', { params: { q: query } }),
}

export const userApi = {
  getProfile: () => api.get<UserProfile>('/user/profile'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/user/profile', data),
  getActivities: (limit = 20) => api.get<Activity[]>(`/user/activities?limit=${limit}`),
}

export const shopApi = {
  getItems: () => api.get<ShopItem[]>('/shop/items'),
  purchase: (itemId: string) => api.post(`/shop/purchase/${itemId}`),
}

export default api
