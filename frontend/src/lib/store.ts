import { create } from 'zustand'
import { api } from '../lib/api'

interface User {
  id: number
  telegramId: number
  username?: string
  firstName: string
  lastName?: string
  isPremium: boolean
  starsBalance: number
}

interface GameState {
  score: number
  level: number
  combo: number
  comboTimer: number | null
  achievements: string[]
  powerUps: { id: string; name: string; active: boolean; cost: number }[]
}

interface AppStore {
  // User
  user: User | null
  token: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void

  // Game
  game: GameState
  setScore: (score: number) => void
  setLevel: (level: number) => void
  setCombo: (combo: number) => void
  addAchievement: (id: string) => void
  activatePowerUp: (id: string) => void
  saveGame: () => Promise<void>
  loadGame: () => Promise<void>

  // Search
  searchHistory: string[]
  addSearchHistory: (query: string) => void
  loadSearchHistory: () => Promise<void>

  // Leaderboard
  leaderboard: any[]
  loadLeaderboard: () => Promise<void>

  // UI
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useStore = create<AppStore>((set, get) => ({
  // User
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token })
  },

  // Game
  game: {
    score: 0,
    level: 1,
    combo: 0,
    comboTimer: null,
    achievements: [],
    powerUps: [
      { id: '2x', name: '2x Points', active: false, cost: 50 },
      { id: '5x', name: '5x Points', active: false, cost: 200 },
      { id: 'auto', name: 'Auto Tap', active: false, cost: 500 },
    ],
  },
  setScore: (score) => set((s) => ({ game: { ...s.game, score } })),
  setLevel: (level) => set((s) => ({ game: { ...s.game, level } })),
  setCombo: (combo) => set((s) => ({ game: { ...s.game, combo } })),
  addAchievement: (id) =>
    set((s) => ({
      game: {
        ...s.game,
        achievements: [...s.game.achievements, id],
      },
    })),
  activatePowerUp: (id) =>
    set((s) => ({
      game: {
        ...s.game,
        powerUps: s.game.powerUps.map((p) =>
          p.id === id ? { ...p, active: !p.active } : p
        ),
      },
    })),
  saveGame: async () => {
    const { game } = get()
    try {
      await api.saveProgress({
        score: game.score,
        level: game.level,
        achievements: game.achievements,
      })
    } catch (err) {
      console.error('Failed to save game:', err)
    }
  },
  loadGame: async () => {
    try {
      const { score, level, achievements } = await api.getProgress()
      set((s) => ({
        game: { ...s.game, score, level, achievements: achievements || [] },
      }))
    } catch (err) {
      console.error('Failed to load game:', err)
    }
  },

  // Search
  searchHistory: [],
  addSearchHistory: (query) =>
    set((s) => ({
      searchHistory: [query, ...s.searchHistory.filter((q) => q !== query)].slice(0, 20),
    })),
  loadSearchHistory: async () => {
    try {
      const { history } = await api.getSearchHistory()
      set({ searchHistory: history.map((h: any) => h.query) })
    } catch (err) {
      console.error('Failed to load search history:', err)
    }
  },

  // Leaderboard
  leaderboard: [],
  loadLeaderboard: async () => {
    try {
      const { players } = await api.getGlobalLeaderboard()
      set({ leaderboard: players })
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    }
  },

  // UI
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))
