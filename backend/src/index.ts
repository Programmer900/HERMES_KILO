import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { env } from './config/env';
import { authRoutes } from './routes/auth';
import { gameRoutes } from './routes/game';
import { searchRoutes } from './routes/search';
import { paymentRoutes } from './routes/payment';

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Register plugins
await app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
  sign: { expiresIn: env.JWT_EXPIRES_IN }
});

// Register JWT authenticate decorator
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized: invalid or expired token' });
  }
});

// Register routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(gameRoutes, { prefix: '/api/game' });
await app.register(searchRoutes, { prefix: '/api/search' });
await app.register(paymentRoutes, { prefix: '/api/payment' });

// Health check
app.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
