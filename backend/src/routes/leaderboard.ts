import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function leaderboardRoutes(app: FastifyInstance) {
  /**
   * GET /api/leaderboard
   * Global rankings — by totalScore, highScore, achievements, or gamesPlayed.
   */
  app.get('/', async (request) => {
    const { sortBy, limit: limitParam } = request.query as {
      sortBy?: string;
      limit?: string;
    };

    const take = Math.min(Number(limitParam) || 50, 100);

    // Determine sort field
    const sortField = sortBy === 'games' ? 'gamesPlayed'
      : sortBy === 'achievements' ? 'achievements'
      : 'highScore'; // default

    let rankings: Array<{
      rank: number;
      userId: number;
      username: string;
      photoUrl: string | null;
      highScore: number;
      level: number;
      gamesPlayed: number;
      achievementCount: number;
    }>;

    if (sortField === 'achievements') {
      // Sort by achievement count
      const users = await prisma.user.findMany({
        take,
        orderBy: { achievements: { _count: 'desc' } },
        select: {
          id: true,
          username: true,
          firstName: true,
          photoUrl: true,
          level: true,
          totalScore: true,
          _count: { select: { achievements: true } },
          gameProgress: { select: { highScore: true, gamesPlayed: true } },
        },
      });

      rankings = users.map((u, i) => ({
        rank: i + 1,
        userId: u.id,
        username: u.username ?? u.firstName,
        photoUrl: u.photoUrl,
        highScore: u.gameProgress?.highScore ?? 0,
        level: u.level,
        gamesPlayed: u.gameProgress?.gamesPlayed ?? 0,
        achievementCount: u._count.achievements,
      }));
    } else {
      // Sort via GameProgress
      const entries = await prisma.gameProgress.findMany({
        take,
        orderBy: sortField === 'gamesPlayed' ? { gamesPlayed: 'desc' } : { highScore: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              photoUrl: true,
              level: true,
              _count: { select: { achievements: true } },
            },
          },
        },
      });

      rankings = entries.map((e, i) => ({
        rank: i + 1,
        userId: e.user.id,
        username: e.user.username ?? e.user.firstName,
        photoUrl: e.user.photoUrl,
        highScore: e.highScore,
        level: e.user.level,
        gamesPlayed: e.gamesPlayed,
        achievementCount: e.user._count.achievements,
      }));
    }

    return {
      sortBy: sortField,
      total: rankings.length,
      rankings,
    };
  });
}
