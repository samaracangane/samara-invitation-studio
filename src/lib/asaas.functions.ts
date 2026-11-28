import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
const access = z.object({ orderId: z.string().uuid(), accessToken: z.string().regex(/^[a-f0-9]{64}$/) });
const checkoutSchema = access.extend({ inviteSlug: z.string().min(1).max(250), customerName: z.string().trim().min(2).max(120), customerCpfCnpj: z.string().transform(s => s.replace(/\D/g,'')).pipe(z.string().regex(/^(\d{11}|\d{14})$/, 'Informe CPF ou CNPJ válido.')), customerEmail: z.string().trim().email().max(254).transform(s => s.toLowerCase()), customerWhatsapp: z.string().trim().regex(/^\+?[0-9()\s-]{10,20}$/), eventDetails: z.record(z.string().max(500)).refine(v => Object.keys(v).length <= 10) });
export const createAsaasCheckout = createServerFn({ method: 'POST' }).inputValidator(input => checkoutSchema.parse(input)).handler(async ({ data }) => {
  const { checkout } = await import('./asaas.server');
  return checkout(data);
});
export const getPaymentStatus = createServerFn({ method: 'POST' }).inputValidator(input => access.extend({ manual: z.boolean().default(false) }).parse(input)).handler(async ({ data }) => {
  const { checkOrder } = await import('./asaas.server');
  return checkOrder(data);
});
export const asaasAdminAction = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => z.object({ action: z.enum(['status','webhook','reconcile']) }).parse(input)).handler(async ({ data, context }) => {
  const { data: admin, error } = await context.supabase.from('admin_users').select('user_id').eq('user_id',context.userId).maybeSingle();
  if (error || !admin) throw new Error('Acesso administrativo não autorizado.');
  const { asaas, setupWebhook, reconcilePayments, webhookUrl } = await import('./asaas.server');
  if (data.action === 'webhook') {
    const email = z.string().email().parse(context.claims['email']);
    await setupWebhook(email);
  }
  if (data.action === 'reconcile') await reconcilePayments();
  const account = z.object({ general: z.string(), bankAccountInfo: z.string() }).parse(await asaas('myAccount/status'));
  const hooks = z.object({ data: z.array(z.object({ url: z.string(), enabled: z.boolean(), interrupted: z.boolean() })) }).parse(await asaas('webhooks'));
  const hook = hooks.data.find(h => h.url === webhookUrl);
  return { accountStatus: account.general, bankStatus: account.bankAccountInfo, webhookActive: Boolean(hook?.enabled && !hook.interrupted) };
});
