import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  TELEGRAM_BOT_TOKEN: z.string(),
  TELEGRAM_BOT_USERNAME: z.string(),
  TELEGRAM_PAYMENT_TOKEN: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  APP_NAME: z.string().default('HERMES_KILO'),
  APP_VERSION: z.string().default('1.0.0')
})

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/hermes',
  JWT_SECRET: 'a-very-long-secret-that-is-at-least-32-chars',
  TELEGRAM_BOT_TOKEN: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11',
  TELEGRAM_BOT_USERNAME: 'hermes_kilo_bot',
}

describe('env config schema', () => {
  it('parses valid env with required fields and defaults', () => {
    const result = envSchema.parse(validEnv)
    expect(result.DATABASE_URL).toBe(validEnv.DATABASE_URL)
    expect(result.JWT_SECRET).toBe(validEnv.JWT_SECRET)
    expect(result.NODE_ENV).toBe('development')
    expect(result.PORT).toBe(3001)
    expect(result.REDIS_URL).toBe('redis://localhost:6379')
    expect(result.JWT_EXPIRES_IN).toBe('7d')
    expect(result.CORS_ORIGIN).toBe('http://localhost:5173')
    expect(result.APP_NAME).toBe('HERMES_KILO')
    expect(result.APP_VERSION).toBe('1.0.0')
    expect(result.TELEGRAM_PAYMENT_TOKEN).toBeUndefined()
  })

  it('accepts overridden defaults', () => {
    const result = envSchema.parse({
      ...validEnv,
      NODE_ENV: 'production',
      PORT: '8080',
      REDIS_URL: 'redis://custom:6380',
      JWT_EXPIRES_IN: '30d',
      CORS_ORIGIN: 'https://example.com',
      APP_NAME: 'CUSTOM_APP',
      APP_VERSION: '2.0.0',
      TELEGRAM_PAYMENT_TOKEN: 'pay_token_123',
    })
    expect(result.NODE_ENV).toBe('production')
    expect(result.PORT).toBe(8080)
    expect(result.REDIS_URL).toBe('redis://custom:6380')
    expect(result.JWT_EXPIRES_IN).toBe('30d')
    expect(result.CORS_ORIGIN).toBe('https://example.com')
    expect(result.APP_NAME).toBe('CUSTOM_APP')
    expect(result.APP_VERSION).toBe('2.0.0')
    expect(result.TELEGRAM_PAYMENT_TOKEN).toBe('pay_token_123')
  })

  it('coerces PORT from string to number', () => {
    const result = envSchema.parse({ ...validEnv, PORT: '9999' })
    expect(result.PORT).toBe(9999)
  })

  it('rejects invalid NODE_ENV', () => {
    expect(() => envSchema.parse({ ...validEnv, NODE_ENV: 'staging' })).toThrow()
  })

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL, ...rest } = validEnv
    expect(() => envSchema.parse(rest)).toThrow()
  })

  it('rejects JWT_SECRET shorter than 32 characters', () => {
    expect(() => envSchema.parse({ ...validEnv, JWT_SECRET: 'short' })).toThrow()
  })

  it('rejects missing TELEGRAM_BOT_TOKEN', () => {
    const { TELEGRAM_BOT_TOKEN, ...rest } = validEnv
    expect(() => envSchema.parse(rest)).toThrow()
  })

  it('rejects missing TELEGRAM_BOT_USERNAME', () => {
    const { TELEGRAM_BOT_USERNAME, ...rest } = validEnv
    expect(() => envSchema.parse(rest)).toThrow()
  })

  it('accepts NODE_ENV test', () => {
    const result = envSchema.parse({ ...validEnv, NODE_ENV: 'test' })
    expect(result.NODE_ENV).toBe('test')
  })
})
