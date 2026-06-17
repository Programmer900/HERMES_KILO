import { FastifyInstance } from 'fastify';
import { authRouteOptions, sendSuccess } from '../utils/route-helpers';
import { GameProgressBody } from '../utils/types';

export async function gameRoutes(app: FastifyInstance) {
  const auth = authRouteOptions(app);

  // Get game progress
  app.get('/game/progress', auth, async (request, reply) => {
    // TODO: Get from database
    return {
      level: 1,
      score: 0,
      achievements: []
    };
  });

  // Update game progress
  app.post('/game/progress', auth, async (request, reply) => {
    const { score, level } = request.body as GameProgressBody;
    
    // TODO: Save to database
    return sendSuccess({ score, level });
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
