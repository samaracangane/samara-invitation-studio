import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
export const Route = createFileRoute('/api/public/asaas-webhook')({ server: { handlers: { POST: async ({ request }) => {
  const expected = process.env['ASAAS_CONNECTION_WEBHOOK_TOKEN'];
  if (!expected || request.headers.get('asaas-access-token') !== expected) return new Response('Asaas webhook: unauthorized', { status: 401 });
  try {
    const payload = z.object({ id: z.string().min(1).max(200), event: z.string(), payment: z.object({ id: z.string().regex(/^pay_[a-zA-Z0-9]+$/) }).optional() }).safeParse(await request.json());
    if (!payload.success || !payload.data.event.startsWith('PAYMENT_') || !payload.data.payment) return Response.json({ ignored: true });
    const { confirmPayment } = await import('@/lib/asaas.server');
    await confirmPayment(payload.data.payment.id, payload.data.id);
    return Response.json({ received: true });
  } catch (error) {
    console.error('Asaas confirmation failed', error);
    return Response.json({ error: 'Não foi possível confirmar o pagamento.' }, { status: 500 });
  }
} } } });
