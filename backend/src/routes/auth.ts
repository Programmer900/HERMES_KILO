import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';

/**
 * Verify Telegram WebApp initData using HMAC-SHA256.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyTelegramInitData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return false;

  params.delete('hash');

  // Sort keys and build data_check_string
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // HMAC-SHA256 with secret key = SHA256(botToken)
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return computedHash === hash;
}

/**
 * Parse Telegram user from initData string.
 */
function parseTelegramUser(initData: string) {
  const params = new URLSearchParams(initData);
  const userStr = params.get('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export async function authRoutes(app: FastifyInstance) {
  /**
   * POST /api/auth/telegram
   * Authenticate via Telegram WebApp initData.
   * Validates HMAC, upserts user, returns JWT.
   */
  app.post('/telegram', async (request, reply) => {
    const { initData } = request.body as { initData: string };

    if (!initData) {
      return reply.code(400).send({ error: 'initData is required' });
    }

    // Verify Telegram signature
    const isValid = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN || '');
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid Telegram initData signature' });
    }

    const tgUser = parseTelegramUser(initData);
    if (!tgUser) {
      return reply.code(401).send({ error: 'Invalid initData: user not found' });
    }

    // Upsert user in database
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(tgUser.id) },
      update: {
        username: tgUser.username ?? null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        languageCode: tgUser.language_code ?? null,
        photoUrl: tgUser.photo_url ?? null,
        isPremium: tgUser.is_premium ?? false,
        lastActiveAt: new Date(),
      },
      create: {
        telegramId: BigInt(tgUser.id),
        username: tgUser.username ?? null,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        languageCode: tgUser.language_code ?? null,
        photoUrl: tgUser.photo_url ?? null,
        isPremium: tgUser.is_premium ?? false,
      },
    });

    // Generate JWT with user id + telegram info
    const token = app.jwt.sign({
      userId: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
    });

    return {
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        isPremium: user.isPremium,
        starsBalance: user.starsBalance,
        level: user.level,
        totalScore: user.totalScore,
      },
    };
  });

  /**
   * GET /api/auth/me
   * Return the current authenticated user's profile.
   */
  app.get('/me', { preValidation: [app.authenticate] }, async (request) => {
    const { userId } = request.user as { userId: number };

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        isPremium: true,
        starsBalance: true,
        level: true,
        totalScore: true,
        comboStreak: true,
        bio: true,
        createdAt: true,
        _count: { select: { achievements: true, purchases: true } },
      },
    });

    return {
      ...user,
      telegramId: user.telegramId.toString(),
    };
  });
}
