import { FastifyInstance } from 'fastify';

export async function gameRoutes(app: FastifyInstance) {
  // Get game progress
  app.get('/game/progress', { preValidation: [app.authenticate] }, async (request, reply) => {
    // TODO: Get from database
    return {
      level: 1,
      score: 0,
      achievements: []
    };
  });

  // Update game progress
  app.post('/game/progress', { preValidation: [app.authenticate] }, async (request, reply) => {
    const body = request.body as Record<string, unknown> | null;

    if (
      !body ||
      typeof body.score !== 'number' ||
      typeof body.level !== 'number'
    ) {
      return reply.code(400).send({ error: 'Missing or invalid score/level (must be numbers)' });
    }

    if (body.score < 0 || body.level < 1) {
      return reply.code(400).send({ error: 'score must be >= 0 and level must be >= 1' });
    }

    const { score, level } = body as { score: number; level: number };

    // TODO: Save to database
    return { success: true, score, level };
  });

  // Get leaderboard
  app.get('/game/leaderboard', async (request, reply) => {
    // TODO: Get from database
    return [
      { rank: 1, username: 'player1', score: 15000 },
      { rank: 2, username: 'player2', score: 12000 },
      { rank: 3, username: 'player3', score: 10000 },
    ];
  });
}
