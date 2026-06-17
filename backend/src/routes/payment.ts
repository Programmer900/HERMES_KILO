import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  amount: z.number().int().positive().max(10000),
  description: z.string().min(1).max(500)
});

const paymentSuccessSchema = z.object({
  telegramPaymentChargeId: z.string().min(1),
  userId: z.number().int().positive()
});

export async function paymentRoutes(app: FastifyInstance) {
  // Create invoice for Telegram Stars payment
  app.post('/payment/create-invoice', { preValidation: [app.authenticate] }, async (request, reply) => {
    const parseResult = createInvoiceSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.issues });
    }

    const { amount, description } = parseResult.data;

    // TODO: Create Telegram Stars invoice via bot API
    return {
      invoiceLink: `https://t.me/$$$`,
      invoiceId: 'invoice_123',
      amount,
      description
    };
  });

  // Handle successful payment (requires authentication)
  app.post('/payment/success', { preValidation: [app.authenticate] }, async (request, reply) => {
    const parseResult = paymentSuccessSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid payment data', details: parseResult.error.issues });
    }

    const { telegramPaymentChargeId, userId } = parseResult.data;

    // TODO: Verify payment with Telegram API and update user balance
    return { success: true, chargeId: telegramPaymentChargeId, userId };
  });

  // Get user balance
  app.get('/payment/balance', { preValidation: [app.authenticate] }, async (request) => {
    // TODO: Get from database
    return { balance: 0, currency: 'Stars' };
  });

  // Get transaction history
  app.get('/payment/transactions', { preValidation: [app.authenticate] }, async (request) => {
    // TODO: Get from database
    return { transactions: [] };
  });
}
