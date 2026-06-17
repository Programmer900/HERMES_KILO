import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const updateProgressSchema = z.object({
  score: z.number().int().min(0).max(1000000),
  level: z.number().int().min(1).max(1000)
});

export async function gameRoutes(app: FastifyInstance) {
  // Get game progress
  app.get('/game/progress', { preValidation: [app.authenticate] }, async (request) => {
    // TODO: Get from database
    return {
      level: 1,
      score: 0,
      achievements: []
    };
  });

  // Update game progress
  app.post('/game/progress', { preValidation: [app.authenticate] }, async (request, reply) => {
    const parseResult = updateProgressSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.issues });
    }

    const { score, level } = parseResult.data;

    // TODO: Save to database
    return { success: true, score, level };
  });

  // Get leaderboard
  app.get('/game/leaderboard', async () => {
    // TODO: Get from database
    return [
      { rank: 1, username: 'player1', score: 15000 },
      { rank: 2, username: 'player2', score: 12000 },
      { rank: 3, username: 'player3', score: 10000 },
    ];
  });
}
