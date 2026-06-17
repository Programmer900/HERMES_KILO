import { FastifyInstance } from 'fastify';

export async function paymentRoutes(app: FastifyInstance) {
  // Create invoice for Telegram Stars payment
  app.post('/payment/create-invoice', { preValidation: [app.authenticate] }, async (request, reply) => {
    const body = request.body as Record<string, unknown> | null;

    if (
      !body ||
      typeof body.amount !== 'number' ||
      typeof body.description !== 'string'
    ) {
      return reply.code(400).send({ error: 'Missing or invalid amount/description' });
    }

    if (body.amount <= 0) {
      return reply.code(400).send({ error: 'Amount must be a positive number' });
    }
    
    // TODO: Create Telegram Stars invoice
    // const invoice = await bot.createInvoiceLink({ ... })
    
    return {
      invoiceLink: 'https://t.me/$$$',
      invoiceId: 'invoice_123'
    };
  });

  // Handle successful payment
  app.post('/payment/success', async (request, reply) => {
    const body = request.body as Record<string, unknown> | null;

    if (
      !body ||
      typeof body.telegramPaymentChargeId !== 'string' ||
      typeof body.userId !== 'string'
    ) {
      return reply.code(400).send({ error: 'Missing or invalid telegramPaymentChargeId/userId' });
    }
    
    // TODO: Verify payment and update user balance
    return { success: true };
  });

  // Get user balance
  app.get('/payment/balance', { preValidation: [app.authenticate] }, async (request, reply) => {
    // TODO: Get from database
    return { balance: 0, currency: 'Stars' };
  });

  // Get transaction history
  app.get('/payment/transactions', { preValidation: [app.authenticate] }, async (request, reply) => {
    // TODO: Get from database
    return { transactions: [] };
  });
}
