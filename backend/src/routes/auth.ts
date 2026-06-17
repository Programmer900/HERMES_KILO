import { FastifyInstance } from 'fastify';
import { createHmac } from 'crypto';
import { z } from 'zod';
import { env } from '../config/env';

const telegramLoginSchema = z.object({
  initData: z.string().min(1)
});

function verifyTelegramInitData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');

  if (!hash) return false;

  // Remove hash from params before verification
  urlParams.delete('hash');

  // Sort params alphabetically and create check string
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create secret key using HMAC-SHA256 of bot token with "WebAppData"
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

  // Compute HMAC-SHA256 of the data check string
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

export async function authRoutes(app: FastifyInstance) {
  // Telegram login verification
  app.post('/auth/telegram', async (request, reply) => {
    const parseResult = telegramLoginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'initData is required' });
    }

    const { initData } = parseResult.data;

    // Verify Telegram WebApp initData HMAC signature
    if (!verifyTelegramInitData(initData, env.TELEGRAM_BOT_TOKEN)) {
      return reply.code(401).send({ error: 'Invalid Telegram initData signature' });
    }

    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');

    if (!userStr) {
      return reply.code(401).send({ error: 'User data not found in initData' });
    }

    let user: { id: number; username?: string; first_name: string };
    try {
      user = JSON.parse(userStr);
    } catch {
      return reply.code(400).send({ error: 'Malformed user data in initData' });
    }

    if (!user.id || !user.first_name) {
      return reply.code(400).send({ error: 'Missing required user fields (id, first_name)' });
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
  app.get('/auth/me', { preValidation: [app.authenticate] }, async (request) => {
    return (request as any).user;
  });
}
