import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

/**
 * Combo multiplier tiers:
 *   streak 0  → 1.0x
 *   streak 3  → 1.5x
 *   streak 5  → 2.0x
 *   streak 10 → 3.0x
 *   streak 20 → 5.0x
 */
function calculateComboMultiplier(streak: number): number {
  if (streak >= 20) return 5.0;
  if (streak >= 10) return 3.0;
  if (streak >= 5) return 2.0;
  if (streak >= 3) return 1.5;
  return 1.0;
}

export async function gameRoutes(app: FastifyInstance) {
  /**
   * GET /api/game/progress
   * Retrieve the authenticated user's game progress.
   */
  app.get('/progress', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };

    const progress = await prisma.gameProgress.findUnique({
      where: { userId },
      include: {
        user: {
          select: { achievements: { include: { achievement: true } } },
        },
      },
    });

    if (!progress) {
      // Return defaults for a new player
      return {
        level: 1,
        score: 0,
        highScore: 0,
        comboMultiplier: 1.0,
        gamesPlayed: 0,
        totalPlayTime: 0,
        achievements: [],
      };
    }

    const achievements = progress.user.achievements.map((ua) => ({
      key: ua.achievement.key,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      unlockedAt: ua.unlockedAt,
    }));

    return {
      level: progress.level,
      score: progress.score,
      highScore: progress.highScore,
      comboMultiplier: progress.comboMultiplier,
      gamesPlayed: progress.gamesPlayed,
      totalPlayTime: progress.totalPlayTime,
      lastPlayed: progress.lastPlayed,
      achievements,
    };
  });

  /**
   * POST /api/game/save
   * Save (update) game progress: score, level, combo streak.
   */
  app.post('/save', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { score, level, playTime } = request.body as {
      score: number;
      level: number;
      playTime?: number;
    };

    if (typeof score !== 'number' || typeof level !== 'number') {
      return reply.code(400).send({ error: 'score and level are required numbers' });
    }

    // Fetch current user + progress for combo calculation
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const existing = await prisma.gameProgress.findUnique({ where: { userId } });

    // Update combo streak — +1 if new score > 0, reset if 0
    const newStreak = score > 0 ? user.comboStreak + 1 : 0;
    const multiplier = calculateComboMultiplier(newStreak);
    const adjustedScore = Math.floor(score * multiplier);

    const highScore = existing
      ? Math.max(existing.highScore, adjustedScore)
      : adjustedScore;

    // Upsert game progress
    const progress = await prisma.gameProgress.upsert({
      where: { userId },
      update: {
        level,
        score: adjustedScore,
        highScore,
        comboMultiplier: multiplier,
        gamesPlayed: { increment: 1 },
        totalPlayTime: { increment: playTime ?? 0 },
        lastPlayed: new Date(),
      },
      create: {
        userId,
        level,
        score: adjustedScore,
        highScore,
        comboMultiplier: multiplier,
        gamesPlayed: 1,
        totalPlayTime: playTime ?? 0,
      },
    });

    // Update user aggregates
    await prisma.user.update({
      where: { id: userId },
      data: {
        level,
        totalScore: { increment: adjustedScore },
        comboStreak: newStreak,
        lastActiveAt: new Date(),
      },
    });

    return {
      success: true,
      score: adjustedScore,
      rawScore: score,
      level: progress.level,
      highScore: progress.highScore,
      comboMultiplier: multiplier,
      comboStreak: newStreak,
    };
  });

  /**
   * GET /api/game/leaderboard
   * Top 50 players by high score.
   */
  app.get('/leaderboard', async (request, reply) => {
    const top = await prisma.gameProgress.findMany({
      orderBy: { highScore: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, username: true, firstName: true, photoUrl: true },
        },
      },
    });

    return top.map((entry, i) => ({
      rank: i + 1,
      userId: entry.user.id,
      username: entry.user.username ?? entry.user.firstName,
      photoUrl: entry.user.photoUrl,
      highScore: entry.highScore,
      level: entry.level,
      gamesPlayed: entry.gamesPlayed,
    }));
  });

  /**
   * POST /api/game/achievement
   * Unlock an achievement for the authenticated user.
   */
  app.post('/achievement', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { achievementKey } = request.body as { achievementKey: string };

    if (!achievementKey) {
      return reply.code(400).send({ error: 'achievementKey is required' });
    }

    // Look up the achievement definition
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey },
    });
    if (!achievement) {
      return reply.code(404).send({ error: 'Achievement not found' });
    }

    // Already unlocked?
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    if (existing) {
      return { alreadyUnlocked: true, achievement: { key: achievement.key, name: achievement.name } };
    }

    // Unlock it
    const unlocked = await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });

    // Bonus: award stars equal to achievement points
    await prisma.user.update({
      where: { id: userId },
      data: { starsBalance: { increment: achievement.points } },
    });

    return {
      unlocked: true,
      achievement: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        points: achievement.points,
      },
      unlockedAt: unlocked.unlockedAt,
    };
  });
}
