import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  // Telegram login verification
  app.post('/auth/telegram', async (request, reply) => {
    const body = request.body as Record<string, unknown> | null;

    if (!body || typeof body.initData !== 'string') {
      return reply.code(400).send({ error: 'Missing or invalid initData' });
    }

    const initData = body.initData;
    
    // TODO: Verify Telegram WebApp initData
    // For now, just parse user data
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      return reply.code(401).send({ error: 'Invalid initData: missing user' });
    }

    let user: { id: number; username?: string; first_name: string };
    try {
      user = JSON.parse(userStr);
    } catch {
      return reply.code(400).send({ error: 'Invalid initData: malformed user JSON' });
    }

    if (!user.id || !user.first_name) {
      return reply.code(400).send({ error: 'Invalid user data: missing id or first_name' });
    }
    
    // Generate JWT token
    const token = app.jwt.sign({ 
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name
    });
    
    return { token, user };
  });

  // Get current user profile
  app.get('/auth/me', { preValidation: [app.authenticate] }, async (request, reply) => {
    const user = (request as unknown as Record<string, unknown>).user;
    if (!user) {
      return reply.code(401).send({ error: 'User not found in request' });
    }
    return user;
  });
}
