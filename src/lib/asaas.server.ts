import { supabaseAdmin as db } from '@/integrations/supabase/client.server';
import { asaasPaymentStatus, paymentMatchesAmount } from './asaas-rules';
import { z } from 'zod';

const paymentSchema = z.object({ id: z.string(), externalReference: z.string().nullish(), value: z.number(), originalValue: z.number().nullish(), status: z.string(), invoiceUrl: z.string().url().optional() });
export type Payment = z.infer<typeof paymentSchema>;
export const webhookUrl = 'https://project--a183aadf-c39c-4f95-9e69-6966bd820701.lovable.app/api/public/asaas-webhook';
export async function asaas(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const key = process.env['LOVABLE_API_KEY'];
  const connection = process.env['ASAAS_CONNECTION_KEY'];
  if (!key || !connection) throw new Error('A conexão Asaas não está disponível.');
  const response = await fetch(`https://connector-gateway.lovable.dev/asaas/${path}`, {
    method, headers: { Authorization: `Bearer ${key}`, 'X-Connection-Api-Key': connection, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`Asaas [${response.status}]: ${text}`);
    throw new Error(`Asaas [${response.status}]: ${text}`);
  }
  return response.json();
}
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
export async function ownedOrder(orderId: string, accessToken: string) {
  const { data, error } = await db.from('orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw error;
  if (!data || !data.access_token_hash || data.access_token_hash !== await hashToken(accessToken)) throw new Error('Pedido não encontrado.');
  return data;
}
export async function confirmPayment(paymentId: string, eventId?: string) {
  const payment = paymentSchema.parse(await asaas(`payments/${encodeURIComponent(paymentId)}`));
  if (!payment.externalReference) return;
  const { data: order, error } = await db.from('orders').select('id,amount_cents,provider_payment_id').eq('id', payment.externalReference).eq('payment_provider', 'asaas').maybeSingle();
  // References belonging to other integrations need not be UUIDs.
  if (error?.code === '22P02') return;
  if (error) throw error;
  if (!order || (order.provider_payment_id && order.provider_payment_id !== payment.id)) return;
  const status = asaasPaymentStatus(payment.status);
  if (!status || !paymentMatchesAmount(payment, order.amount_cents)) return;
  const { error: writeError } = await db.rpc('apply_asaas_payment', { p_order_id: order.id, p_payment_id: payment.id, p_status: status, ...(eventId ? { p_event_id: eventId } : {}) });
  if (writeError) throw writeError;
}
export async function findPayment(orderId: string) {
  const result = z.object({ data: z.array(paymentSchema) }).parse(await asaas(`payments?externalReference=${encodeURIComponent(orderId)}&limit=100`));
  if (result.data.length > 1) throw new Error('Há mais de uma cobrança para este pedido. Consulte a administradora.');
  return result.data[0];
}
export async function checkout(input: { orderId: string; accessToken: string; inviteSlug: string; customerName: string; customerCpfCnpj: string; customerEmail: string; customerWhatsapp: string; eventDetails: Record<string, string> }) {
  const { data: existing, error: readError } = await db.from('orders').select('id').eq('id', input.orderId).maybeSingle();
  if (readError) throw readError;
  if (!existing) {
    const { data: invite, error } = await db.from('invites').select('slug,name,price,image_url').eq('slug', input.inviteSlug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    if (!invite) throw new Error('Convite não encontrado no catálogo.');
    const cents = Math.round(Number(invite.price) * 100);
    if (!Number.isSafeInteger(cents) || cents < 500) throw new Error('O Asaas aceita cobranças a partir de R$ 5,00. Este convite precisa ter seu preço ajustado pela administradora.');
    const { error: insertError } = await db.from('orders').insert({ id: input.orderId, invite_id: invite.slug, invite_name: invite.name, invite_image_url: invite.image_url, amount_cents: cents, customer_name: input.customerName, customer_email: input.customerEmail, customer_whatsapp: input.customerWhatsapp, event_details: input.eventDetails, payment_provider: 'asaas', payment_status: 'pending', idempotency_key: input.orderId, access_token_hash: await hashToken(input.accessToken) });
    if (insertError && insertError.code !== '23505') throw insertError;
  }
  let order = await ownedOrder(input.orderId, input.accessToken);
  if (order.payment_provider !== 'asaas' || order.invite_id !== input.inviteSlug) throw new Error('Pedido inválido para o Asaas.');
  if (order.checkout_url) return { orderId: order.id, accessToken: input.accessToken, checkoutUrl: order.checkout_url };
  const { data: claimed, error: claimError } = await db.rpc('claim_asaas_checkout', { p_order_id: order.id });
  if (claimError) throw claimError;
  if (!claimed) throw new Error('Seu pagamento está sendo preparado. Aguarde dois minutos antes de tentar novamente.');
  // Always reconcile BEFORE another POST: a timeout may have created a real charge.
  let payment = await findPayment(order.id);
  if (!payment) {
    let customerId = order.asaas_customer_id;
    if (!customerId) {
      const customers = z.object({ data: z.array(z.object({ id: z.string() })) }).parse(await asaas(`customers?cpfCnpj=${input.customerCpfCnpj}&limit=1`));
      customerId = customers.data[0]?.id ?? z.object({ id: z.string() }).parse(await asaas('customers', 'POST', { name: input.customerName, cpfCnpj: input.customerCpfCnpj, email: input.customerEmail, notificationDisabled: true })).id;
      const { error } = await db.from('orders').update({ asaas_customer_id: customerId }).eq('id', order.id);
      if (error) throw error;
    }
    payment = paymentSchema.parse(await asaas('payments', 'POST', { customer: customerId, billingType: 'UNDEFINED', value: order.amount_cents / 100, dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), externalReference: order.id, description: order.invite_name, callback: { successUrl: 'https://samarastudioarts.lovable.app/retorno', autoRedirect: true } }));
  }
  if (!payment.invoiceUrl?.startsWith('https://')) throw new Error('O Asaas não retornou um link de pagamento seguro.');
  const { error: saveError } = await db.from('orders').update({ provider_payment_id: payment.id, checkout_url: payment.invoiceUrl }).eq('id', order.id);
  if (saveError) throw saveError;
  order = await ownedOrder(order.id, input.accessToken);
  return { orderId: order.id, accessToken: input.accessToken, checkoutUrl: payment.invoiceUrl };
}
export async function checkOrder(input: { orderId: string; accessToken: string; manual: boolean }) {
  let order = await ownedOrder(input.orderId, input.accessToken);
  if (order.payment_provider === 'asaas' && ['pending','chargedback'].includes(order.payment_status) && (input.manual || Date.now() - Date.parse(order.created_at) < 5 * 60000)) {
    const { data: claimed, error } = await db.rpc('claim_asaas_check', { p_order_id: order.id });
    if (error) throw error;
    if (claimed) {
      const paymentId = order.provider_payment_id ?? (await findPayment(order.id))?.id;
      if (paymentId) await confirmPayment(paymentId);
      order = await ownedOrder(input.orderId, input.accessToken);
    }
  }
  return { status: order.payment_status, inviteId: order.invite_id, inviteName: order.invite_name, amountCents: order.amount_cents, checkoutUrl: order.checkout_url };
}
export async function setupWebhook(email: string) {
  const token = process.env['ASAAS_CONNECTION_WEBHOOK_TOKEN'];
  if (!token) throw new Error('A confirmação automática ainda não está configurada.');
  // Only register after the published route is present and rejects unauthenticated calls.
  const probe = await fetch(webhookUrl, { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (probe.status !== 401 || await probe.text() !== 'Asaas webhook: unauthorized') throw new Error('Publique a loja antes de ativar a confirmação automática.');
  const hooks = z.object({ data: z.array(z.object({ id: z.string(), url: z.string() })) }).parse(await asaas('webhooks'));
  const existing = hooks.data.find(h => h.url === webhookUrl);
  await asaas(existing ? `webhooks/${existing.id}` : 'webhooks', existing ? 'PUT' : 'POST', { name: 'Samara — confirmação de pedidos', url: webhookUrl, email, enabled: true, interrupted: false, apiVersion: 3, sendType: 'SEQUENTIALLY', authToken: token, events: ['PAYMENT_CONFIRMED','PAYMENT_RECEIVED','PAYMENT_OVERDUE','PAYMENT_REFUNDED','PAYMENT_DELETED','PAYMENT_CHARGEBACK_REQUESTED','PAYMENT_CHARGEBACK_DISPUTE','PAYMENT_AWAITING_CHARGEBACK_REVERSAL'] });
}
export async function reconcilePayments() {
  const { data: oldest, error } = await db.from('orders').select('created_at').eq('payment_provider','asaas').in('payment_status',['pending','chargedback']).order('created_at').limit(1).maybeSingle();
  if (error) throw error;
  if (!oldest) return;
  const from = oldest.created_at.slice(0,10);
  for (const filter of [`paymentDate[ge]=${from}`, `status=CONFIRMED&dateCreated[ge]=${from}`]) {
    let offset = 0;
    while (true) {
      const page = z.object({ data: z.array(paymentSchema), hasMore: z.boolean() }).parse(await asaas(`payments?${filter}&limit=100&offset=${offset}`));
      const refs = page.data.flatMap(p => p.externalReference && z.string().uuid().safeParse(p.externalReference).success ? [p.externalReference] : []);
      if (refs.length) {
        const { data: orders, error: lookupError } = await db.from('orders').select('id').eq('payment_provider','asaas').in('payment_status',['pending','chargedback']).in('id', refs);
        if (lookupError) throw lookupError;
        const ids = new Set(orders?.map(o => o.id));
        for (const payment of page.data) if (payment.externalReference && ids.has(payment.externalReference)) await confirmPayment(payment.id);
      }
      if (!page.hasMore) break;
      offset += 100;
    }
  }
  let offset = 0;
  while (true) {
    const { data: disputed, error: disputeError } = await db.from('orders').select('provider_payment_id').eq('payment_provider','asaas').eq('payment_status','chargedback').order('id').range(offset,offset+99);
    if (disputeError) throw disputeError;
    for (const order of disputed ?? []) if (order.provider_payment_id) await confirmPayment(order.provider_payment_id);
    if (!disputed || disputed.length < 100) break;
    offset += 100;
  }
}
