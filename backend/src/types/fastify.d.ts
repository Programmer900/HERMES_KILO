import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      userId: number;
      telegramId: string;
      username?: string;
      firstName: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
