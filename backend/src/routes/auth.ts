import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  // Telegram login verification
  app.post('/auth/telegram', async (request, reply) => {
    const { initData } = request.body as { initData: string };
    
    // TODO: Verify Telegram WebApp initData
    // For now, just parse user data
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      return reply.code(401).send({ error: 'Invalid initData' });
    }
    
    const user = JSON.parse(userStr);
    
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
    return (request as any).user;
  });
}
