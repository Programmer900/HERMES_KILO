import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function profileRoutes(app: FastifyInstance) {
  /**
   * GET /api/profile
   * Return the authenticated user's full profile.
   */
  app.get('/', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        gameProgress: true,
        achievements: { include: { achievement: true } },
        _count: { select: { purchases: true, transactions: true, searchQueries: true } },
      },
    });

    return {
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      photoUrl: user.photoUrl,
      bio: user.bio,
      isPremium: user.isPremium,
      starsBalance: user.starsBalance,
      level: user.level,
      totalScore: user.totalScore,
      comboStreak: user.comboStreak,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      gameProgress: user.gameProgress
        ? {
            highScore: user.gameProgress.highScore,
            gamesPlayed: user.gameProgress.gamesPlayed,
            totalPlayTime: user.gameProgress.totalPlayTime,
            comboMultiplier: user.gameProgress.comboMultiplier,
          }
        : null,
      achievements: user.achievements.map((ua) => ({
        key: ua.achievement.key,
        name: ua.achievement.name,
        icon: ua.achievement.icon,
        points: ua.achievement.points,
        unlockedAt: ua.unlockedAt,
      })),
      stats: user._count,
    };
  });

  /**
   * PUT /api/profile
   * Update the authenticated user's profile (editable fields only).
   */
  app.put('/', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { firstName, lastName, bio, languageCode } = request.body as {
      firstName?: string;
      lastName?: string;
      bio?: string;
      languageCode?: string;
    };

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (bio !== undefined) data.bio = bio?.slice(0, 500) ?? null; // cap bio length
    if (languageCode !== undefined) data.languageCode = languageCode;

    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ error: 'No fields to update' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        photoUrl: true,
        bio: true,
        languageCode: true,
        updatedAt: true,
      },
    });

    return { success: true, user: updated };
  });
}
