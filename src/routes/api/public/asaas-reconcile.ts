import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/api/public/asaas-reconcile')({ server: { handlers: { POST: async ({ request }) => {
  const secret = process.env['LOVABLE_CRON_SECRET'];
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });
  try {
    const { reconcilePayments } = await import('@/lib/asaas.server');
    await reconcilePayments();
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Asaas reconciliation failed',error);
    return Response.json({ error: 'Falha na reconciliação.' },{ status:500 });
  }
} } } });
