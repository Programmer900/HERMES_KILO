import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp, signToken } from './helpers'
import { gameRoutes } from '../routes/game'

describe('game routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = await buildApp()
    await app.register(gameRoutes, { prefix: '/api/game' })
    await app.ready()
    token = signToken(app, { telegramId: 1, username: 'player' })
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/game/game/progress', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/game/game/progress'
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns default game progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/game/game/progress',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.level).toBe(1)
      expect(body.score).toBe(0)
      expect(body.achievements).toEqual([])
    })
  })

  describe('POST /api/game/game/progress', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/game/game/progress',
        payload: { score: 100, level: 2 }
      })
      expect(response.statusCode).toBe(401)
    })

    it('accepts score and level update', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/game/game/progress',
        headers: { authorization: `Bearer ${token}` },
        payload: { score: 500, level: 5 }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.success).toBe(true)
      expect(body.score).toBe(500)
      expect(body.level).toBe(5)
    })
  })

  describe('GET /api/game/game/leaderboard', () => {
    it('returns leaderboard without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/game/game/leaderboard'
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(Array.isArray(body)).toBe(true)
      expect(body).toHaveLength(3)
      expect(body[0]).toHaveProperty('rank', 1)
      expect(body[0]).toHaveProperty('username')
      expect(body[0]).toHaveProperty('score')
    })

    it('returns leaderboard sorted by rank', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/game/game/leaderboard'
      })

      const body = response.json()
      for (let i = 1; i < body.length; i++) {
        expect(body[i].rank).toBeGreaterThan(body[i - 1].rank)
        expect(body[i].score).toBeLessThan(body[i - 1].score)
      }
    })
  })
})
