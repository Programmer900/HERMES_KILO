import Fastify, { FastifyInstance } from 'fastify'
import jwt from '@fastify/jwt'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })

  await app.register(jwt, {
    secret: 'test-secret-that-is-at-least-32-characters-long',
    sign: { expiresIn: '7d' }
  })

  app.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })

  return app
}

export function signToken(app: FastifyInstance, payload: Record<string, unknown>): string {
  return app.jwt.sign(payload)
}
