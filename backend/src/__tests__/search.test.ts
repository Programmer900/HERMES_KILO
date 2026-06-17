import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp, signToken } from './helpers'
import { searchRoutes } from '../routes/search'

describe('search routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = await buildApp()
    await app.register(searchRoutes, { prefix: '/api/search' })
    await app.ready()
    token = signToken(app, { telegramId: 1, username: 'searcher' })
  })

  afterEach(async () => {
    await app.close()
  })

  describe('GET /api/search/search', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search?q=hello'
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns results for valid query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search?q=test',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.query).toBe('test')
      expect(body.results).toBeDefined()
      expect(Array.isArray(body.results)).toBe(true)
      expect(body.total).toBe(2)
    })

    it('returns 400 for query shorter than 2 chars', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search?q=a',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body.error).toBe('Query must be at least 2 characters')
    })

    it('returns 400 for empty query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search?q=',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(400)
    })

    it('returns 400 for missing query parameter', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(400)
    })

    it('search results have expected shape', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search?q=test',
        headers: { authorization: `Bearer ${token}` }
      })

      const body = response.json()
      for (const result of body.results) {
        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('title')
        expect(result).toHaveProperty('description')
      }
    })
  })

  describe('POST /api/search/search/history', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/search/search/history',
        payload: { query: 'test', resultsCount: 5 }
      })
      expect(response.statusCode).toBe(401)
    })

    it('saves search history entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/search/search/history',
        headers: { authorization: `Bearer ${token}` },
        payload: { query: 'test query', resultsCount: 10 }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('GET /api/search/search/history', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search/history'
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns empty history', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/search/search/history',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.history).toEqual([])
    })
  })
})
