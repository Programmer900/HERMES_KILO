const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request<T>(path: string, opts: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...init } = opts
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    body: json ? JSON.stringify(json) : init.body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Auth
  login: (initData: string) =>
    request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      json: { initData },
    }),

  // Game
  getProgress: () =>
    request<{ score: number; level: number; achievements: any[] }>('/api/game/progress'),

  saveProgress: (data: { score: number; level: number; achievements?: string[] }) =>
    request<{ success: boolean }>('/api/game/save', { method: 'POST', json: data }),

  getLeaderboard: () =>
    request<{ players: any[] }>('/api/game/leaderboard'),

  unlockAchievement: (achievementId: string) =>
    request<{ success: boolean }>('/api/game/achievement', {
      method: 'POST',
      json: { achievementId },
    }),

  // Search
  search: (query: string, filters?: { type?: string; date?: string }) =>
    request<{ results: any[] }>('/api/search', {
      method: 'POST',
      json: { query, ...filters },
    }),

  getSearchHistory: () =>
    request<{ history: any[] }>('/api/search/history'),

  // Profile
  getProfile: () =>
    request<{ user: any }>('/api/profile'),

  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    request<{ user: any }>('/api/profile', { method: 'PUT', json: data }),

  // Shop
  getShopItems: () =>
    request<{ items: any[] }>('/api/shop/items'),

  buyItem: (itemId: string) =>
    request<{ success: boolean; transaction: any }>('/api/shop/buy', {
      method: 'POST',
      json: { itemId },
    }),

  // Leaderboard
  getGlobalLeaderboard: (period?: 'daily' | 'weekly' | 'all') =>
    request<{ players: any[] }>(`/api/leaderboard${period ? `?period=${period}` : ''}`),
}
