import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function shopRoutes(app: FastifyInstance) {
  /**
   * GET /api/shop/items
   * List all active shop items.
   */
  app.get('/items', async (request) => {
    const { category } = request.query as { category?: string };

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: { price: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        icon: true,
        category: true,
        price: true,
        metadata: true,
      },
    });

    return { items };
  });

  /**
   * POST /api/shop/buy
   * Purchase a shop item with Stars.
   */
  app.post('/buy', { preValidation: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: number };
    const { itemId, quantity } = request.body as { itemId: number; quantity?: number };

    if (!itemId) {
      return reply.code(400).send({ error: 'itemId is required' });
    }

    const qty = Math.max(1, quantity ?? 1);

    // Fetch item
    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item || !item.isActive) {
      return reply.code(404).send({ error: 'Item not found or unavailable' });
    }

    const totalCost = item.price * qty;

    // Fetch user balance
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.starsBalance < totalCost) {
      return reply.code(402).send({
        error: 'Insufficient Stars balance',
        required: totalCost,
        available: user.starsBalance,
      });
    }

    // Atomic: deduct balance + create purchase + transaction
    const [purchase] = await prisma.$transaction([
      prisma.purchase.create({
        data: {
          userId,
          itemId,
          quantity: qty,
          totalCost,
          status: 'completed',
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { starsBalance: { decrement: totalCost } },
      }),
      prisma.transaction.create({
        data: {
          userId,
          amount: -totalCost,
          type: 'spend',
          status: 'completed',
          description: `Purchased ${qty}x ${item.name}`,
        },
      }),
    ]);

    return {
      success: true,
      purchase: {
        id: purchase.id,
        item: item.name,
        quantity: qty,
        totalCost,
      },
      remainingBalance: user.starsBalance - totalCost,
    };
  });
}
