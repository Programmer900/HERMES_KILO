import { FastifyInstance } from 'fastify';
import { authRouteOptions, sendSuccess } from '../utils/route-helpers';
import { PaymentInvoiceBody, PaymentSuccessBody } from '../utils/types';

export async function paymentRoutes(app: FastifyInstance) {
  const auth = authRouteOptions(app);

  // Create invoice for Telegram Stars payment
  app.post('/payment/create-invoice', auth, async (request, reply) => {
    const { amount, description } = request.body as PaymentInvoiceBody;
    
    // TODO: Create Telegram Stars invoice
    // const invoice = await bot.createInvoiceLink({ ... })
    
    return {
      invoiceLink: 'https://t.me/$$$',
      invoiceId: 'invoice_123'
    };
  });

  // Handle successful payment
  app.post('/payment/success', async (request, reply) => {
    const { telegramPaymentChargeId, userId } = request.body as PaymentSuccessBody;
    
    // TODO: Verify payment and update user balance
    return sendSuccess();
  });

  // Get user balance
  app.get('/payment/balance', auth, async (request, reply) => {
    // TODO: Get from database
    return { balance: 0, currency: 'Stars' };
  });

  // Get transaction history
  app.get('/payment/transactions', auth, async (request, reply) => {
    // TODO: Get from database
    return { transactions: [] };
  });
}
