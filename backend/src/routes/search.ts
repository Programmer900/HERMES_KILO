import { FastifyInstance } from 'fastify';
import { authRouteOptions, sendError, sendSuccess } from '../utils/route-helpers';
import { SearchHistoryBody, SearchQuery } from '../utils/types';

export async function searchRoutes(app: FastifyInstance) {
  const auth = authRouteOptions(app);

  app.get('/search', auth, async (request, reply) => {
    const { q } = request.query as SearchQuery;
    
    if (!q || q.length < 2) {
      return sendError(reply, 400, 'Query must be at least 2 characters');
    }
    
    // TODO: Implement actual search logic
    return {
      query: q,
      results: [
        { id: 1, title: 'Result 1', description: 'Description 1' },
        { id: 2, title: 'Result 2', description: 'Description 2' },
      ],
      total: 2
    };
  });

  // Save search history
  app.post('/search/history', auth, async (request, reply) => {
    const { query, resultsCount } = request.body as SearchHistoryBody;
    
    // TODO: Save to database
    return sendSuccess();
  });

  // Get search history
  app.get('/search/history', auth, async (request, reply) => {
    // TODO: Get from database
    return { history: [] };
  });
}
