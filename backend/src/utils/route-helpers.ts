import { FastifyInstance, FastifyReply, RouteShorthandOptions } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export function authRouteOptions(app: FastifyInstance): RouteShorthandOptions {
  return { preValidation: [app.authenticate] };
}

export function sendError(reply: FastifyReply, statusCode: number, message: string) {
  return reply.code(statusCode).send({ error: message });
}

export function sendSuccess<T extends Record<string, unknown>>(data?: T) {
  return { success: true as const, ...data };
}
