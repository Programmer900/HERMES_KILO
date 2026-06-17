import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp, signToken } from './helpers'
import { authRoutes } from '../routes/auth'

describe('auth routes', () => {
  let app: FastifyInstance

  beforeEach(async () => {
    app = await buildApp()
    await app.register(authRoutes, { prefix: '/api/auth' })
    await app.ready()
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/auth/auth/telegram', () => {
    it('returns token and user for valid initData', async () => {
      const user = { id: 123, username: 'testuser', first_name: 'Test' }
      const initData = `user=${encodeURIComponent(JSON.stringify(user))}&hash=abc`

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/auth/telegram',
        payload: { initData }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.token).toBeDefined()
      expect(body.user).toEqual(user)
    })

    it('returns 401 when user is missing from initData', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/auth/telegram',
        payload: { initData: 'hash=abc123' }
      })

      expect(response.statusCode).toBe(401)
      const body = response.json()
      expect(body.error).toBe('Invalid initData')
    })

    it('returns 401 for empty initData', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/auth/telegram',
        payload: { initData: '' }
      })

      expect(response.statusCode).toBe(401)
      const body = response.json()
      expect(body.error).toBe('Invalid initData')
    })

    it('generated token contains correct payload', async () => {
      const user = { id: 456, username: 'alice', first_name: 'Alice' }
      const initData = `user=${encodeURIComponent(JSON.stringify(user))}`

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/auth/telegram',
        payload: { initData }
      })

      const body = response.json()
      const decoded = app.jwt.verify<{ telegramId: number; username: string; firstName: string }>(body.token)
      expect(decoded.telegramId).toBe(456)
      expect(decoded.username).toBe('alice')
      expect(decoded.firstName).toBe('Alice')
    })
  })

  describe('GET /api/auth/auth/me', () => {
    it('returns 401 without auth token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/auth/me'
      })

      expect(response.statusCode).toBe(401)
    })

    it('returns user data with valid token', async () => {
      const payload = { telegramId: 789, username: 'bob', firstName: 'Bob' }
      const token = signToken(app, payload)

      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/auth/me',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.telegramId).toBe(789)
      expect(body.username).toBe('bob')
    })
  })
})
