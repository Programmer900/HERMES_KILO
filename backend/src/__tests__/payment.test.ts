import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp, signToken } from './helpers'
import { paymentRoutes } from '../routes/payment'

describe('payment routes', () => {
  let app: FastifyInstance
  let token: string

  beforeEach(async () => {
    app = await buildApp()
    await app.register(paymentRoutes, { prefix: '/api/payment' })
    await app.ready()
    token = signToken(app, { telegramId: 1, username: 'payer' })
  })

  afterEach(async () => {
    await app.close()
  })

  describe('POST /api/payment/payment/create-invoice', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payment/payment/create-invoice',
        payload: { amount: 100, description: 'Test payment' }
      })
      expect(response.statusCode).toBe(401)
    })

    it('creates invoice and returns link', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payment/payment/create-invoice',
        headers: { authorization: `Bearer ${token}` },
        payload: { amount: 100, description: 'Test payment' }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.invoiceLink).toBeDefined()
      expect(typeof body.invoiceLink).toBe('string')
      expect(body.invoiceId).toBeDefined()
    })
  })

  describe('POST /api/payment/payment/success', () => {
    it('handles successful payment', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/payment/payment/success',
        payload: { telegramPaymentChargeId: 'charge_123', userId: 1 }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('GET /api/payment/payment/balance', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/payment/payment/balance'
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns user balance', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/payment/payment/balance',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.balance).toBe(0)
      expect(body.currency).toBe('Stars')
    })
  })

  describe('GET /api/payment/payment/transactions', () => {
    it('returns 401 without auth', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/payment/payment/transactions'
      })
      expect(response.statusCode).toBe(401)
    })

    it('returns empty transaction history', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/payment/payment/transactions',
        headers: { authorization: `Bearer ${token}` }
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.transactions).toEqual([])
    })
  })
})
