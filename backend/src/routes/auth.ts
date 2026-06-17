import { FastifyInstance } from 'fastify';
import { authRouteOptions, sendError } from '../utils/route-helpers';
import { TelegramAuthBody } from '../utils/types';

export async function authRoutes(app: FastifyInstance) {
  // Telegram login verification
  app.post('/auth/telegram', async (request, reply) => {
    const { initData } = request.body as TelegramAuthBody;
    
    // TODO: Verify Telegram WebApp initData
    // For now, just parse user data
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      return sendError(reply, 401, 'Invalid initData');
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
  app.get('/auth/me', authRouteOptions(app), async (request, reply) => {
    return (request as any).user;
  });
}
