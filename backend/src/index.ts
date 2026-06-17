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

// Register routes
await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(gameRoutes, { prefix: '/api/game' });
await app.register(searchRoutes, { prefix: '/api/search' });
await app.register(paymentRoutes, { prefix: '/api/payment' });

// Global error handler
app.setErrorHandler((error, request, reply) => {
  request.log.error({ err: error, url: request.url, method: request.method }, 'Request error');

  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
    });
  }

  const statusCode = error.statusCode ?? 500;
  const message =
    statusCode >= 500 && env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message;

  return reply.code(statusCode).send({ error: message });
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Root
app.get('/', async () => {
  return { 
    name: env.APP_NAME, 
    version: env.APP_VERSION,
    message: 'HERMES_KILO API is running' 
  };
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info(`Received ${signal}, shutting down gracefully`);
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  app.log.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  app.log.error({ err: error }, 'Uncaught exception — shutting down');
  process.exit(1);
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`Server running on http://0.0.0.0:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
