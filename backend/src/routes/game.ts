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
    const { score, level } = request.body as { score: number; level: number };
    
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
