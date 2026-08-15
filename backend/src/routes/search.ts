import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function searchRoutes(app: FastifyInstance) {
  /**
   * POST /api/search
   * Log a search query and return (mock) results.
   */
  app.post('/', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { query } = request.body as { query: string };

    if (!query || query.trim().length < 2) {
      return reply.code(400).send({ error: 'Query must be at least 2 characters' });
    }

    const trimmed = query.trim();

    // TODO: Replace with real search engine (e.g. Elasticsearch, Meilisearch, or full-text Postgres)
    // For now, do a simple ILIKE search against SearchQuery history for "suggestions"
    const results = [
      { id: 1, title: `Result for "${trimmed}"`, description: 'Placeholder result 1' },
      { id: 2, title: `Another result for "${trimmed}"`, description: 'Placeholder result 2' },
    ];

    // Log the query
    await prisma.searchQuery.create({
      data: { userId, query: trimmed, results: results.length },
    });

    return { query: trimmed, results, total: results.length };
  });

  /**
   * GET /api/search
   * Search (GET variant — also logs the query).
   */
  app.get('/', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { q } = request.query as { q?: string };

    if (!q || q.trim().length < 2) {
      return reply.code(400).send({ error: 'Query (q) must be at least 2 characters' });
    }

    const trimmed = q.trim();

    const results = [
      { id: 1, title: `Result for "${trimmed}"`, description: 'Placeholder result 1' },
      { id: 2, title: `Another result for "${trimmed}"`, description: 'Placeholder result 2' },
    ];

    await prisma.searchQuery.create({
      data: { userId, query: trimmed, results: results.length },
    });

    return { query: trimmed, results, total: results.length };
  });

  /**
   * GET /api/search/history
   * Return the authenticated user's recent search history.
   */
  app.get('/history', { preValidation: [app.authenticate] }, async (request) => {
    const { userId } = request.user as { userId: number };
    const { limit } = request.query as { limit?: string };

    const take = Math.min(Number(limit) || 20, 100);

    const history = await prisma.searchQuery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, query: true, results: true, createdAt: true },
    });

    return { history };
  });

  /**
   * GET /api/search/suggestions
   * Return search suggestions based on the user's past queries.
   */
  app.get('/suggestions', { preValidation: [app.authenticate] }, async (request) => {
    const { userId } = request.user as { userId: number };
    const { q } = request.query as { q?: string };

    if (!q || q.trim().length < 1) {
      return { suggestions: [] };
    }

    // Find past queries that start with or contain the prefix
    const matches = await prisma.searchQuery.findMany({
      where: {
        userId,
        query: { contains: q.trim(), mode: 'insensitive' },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { query: true },
      distinct: ['query'],
    });

    return { suggestions: matches.map((m) => m.query) };
  });
}
