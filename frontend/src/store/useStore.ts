import { create } from 'zustand'
import type { GameProgress, Achievement, Activity } from '../api/client'

interface AppState {
  // Game state
  score: number
  level: number
  stars: number
  combo: number
  comboMultiplier: number
  comboTimer: number | null
  achievements: Achievement[]
  activePowerUps: { id: string; multiplier: number; expiresAt: number }[]
  particles: { id: number; x: number; y: number; dx: number; dy: number; life: number; color: string }[]
  autoTapActive: boolean

  // UI state
  isLoading: boolean
  error: string | null
  activities: Activity[]
  searchHistory: string[]

  // Actions
  setProgress: (p: GameProgress) => void
  incrementScore: (amount: number) => void
  incrementCombo: () => void
  resetCombo: () => void
  addStars: (amount: number) => void
  spendStars: (amount: number) => boolean
  activatePowerUp: (id: string, multiplier: number, duration: number) => void
  tickPowerUps: () => void
  addParticle: (x: number, y: number) => void
  removeParticle: (id: number) => void
  clearParticles: () => void
  setAutoTap: (active: boolean) => void
  setActivities: (a: Activity[]) => void
  addSearchHistory: (query: string) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  unlockAchievement: (a: Achievement) => void
}

let particleId = 0

export const useStore = create<AppState>((set, get) => ({
  score: 0,
  level: 1,
  stars: 0,
  combo: 0,
  comboMultiplier: 1,
  comboTimer: null,
  achievements: [],
  activePowerUps: [],
  particles: [],
  autoTapActive: false,

  isLoading: false,
  error: null,
  activities: [],
  searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),

  setProgress: (p) => set({
    score: p.score,
    level: p.level,
    stars: p.stars,
    achievements: p.achievements,
  }),

  incrementScore: (amount) => {
    const state = get()
    let totalMultiplier = state.comboMultiplier
    for (const pu of state.activePowerUps) {
      totalMultiplier *= pu.multiplier
    }
    set({ score: state.score + Math.floor(amount * totalMultiplier) })
  },

  incrementCombo: () => {
    const state = get()
    const newCombo = state.combo + 1
    let newMultiplier = 1
    if (newCombo >= 50) newMultiplier = 5
    else if (newCombo >= 30) newMultiplier = 3
    else if (newCombo >= 15) newMultiplier = 2
    else if (newCombo >= 5) newMultiplier = 1.5

    if (state.comboTimer) clearTimeout(state.comboTimer)
    const timer = setTimeout(() => get().resetCombo(), 2000)

    set({ combo: newCombo, comboMultiplier: newMultiplier, comboTimer: timer as unknown as number })
  },

  resetCombo: () => set({ combo: 0, comboMultiplier: 1, comboTimer: null }),

  addStars: (amount) => set((s) => ({ stars: s.stars + amount })),

  spendStars: (amount) => {
    const state = get()
    if (state.stars < amount) return false
    set({ stars: state.stars - amount })
    return true
  },

  activatePowerUp: (id, multiplier, duration) => {
    set((s) => ({
      activePowerUps: [...s.activePowerUps.filter(p => p.id !== id), { id, multiplier, expiresAt: Date.now() + duration * 1000 }],
    }))
  },

  tickPowerUps: () => {
    const now = Date.now()
    set((s) => ({
      activePowerUps: s.activePowerUps.filter(p => p.expiresAt > now),
    }))
  },

  addParticle: (x, y) => {
    const id = ++particleId
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
    const particle = {
      id,
      x,
      y,
      dx: (Math.random() - 0.5) * 8,
      dy: (Math.random() - 0.5) * 8 - 3,
      life: 1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
    set((s) => ({ particles: [...s.particles, particle] }))
    setTimeout(() => get().removeParticle(id), 600)
  },

  removeParticle: (id) => set((s) => ({ particles: s.particles.filter(p => p.id !== id) })),

  clearParticles: () => set({ particles: [] }),

  setAutoTap: (active) => set({ autoTapActive: active }),

  setActivities: (a) => set({ activities: a }),

  addSearchHistory: (query) => {
    const history = [query, ...get().searchHistory.filter(q => q !== query)].slice(0, 10)
    localStorage.setItem('searchHistory', JSON.stringify(history))
    set({ searchHistory: history })
  },

  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  unlockAchievement: (a) => {
    const existing = get().achievements
    if (!existing.find(e => e.id === a.id)) {
      set({ achievements: [...existing, { ...a, unlocked: true, unlockedAt: new Date().toISOString() }] })
    }
  },
}))
