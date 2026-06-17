import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().min(2).max(200)
});

const searchHistorySchema = z.object({
  query: z.string().min(1).max(200),
  resultsCount: z.number().int().min(0).max(10000)
});

export async function searchRoutes(app: FastifyInstance) {
  app.get('/search', { preValidation: [app.authenticate] }, async (request, reply) => {
    const parseResult = searchQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Query must be between 2 and 200 characters' });
    }

    const { q } = parseResult.data;

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
  app.post('/search/history', { preValidation: [app.authenticate] }, async (request, reply) => {
    const parseResult = searchHistorySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.issues });
    }

    // TODO: Save to database
    return { success: true };
  });

  // Get search history
  app.get('/search/history', { preValidation: [app.authenticate] }, async (request) => {
    // TODO: Get from database
    return { history: [] };
  });
}
