import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);
  const expectedToken = Deno.env.get("WIAPY_WEBHOOK_TOKEN");
  const receivedToken = request.headers.get("authorization") ?? "";
  if (!expectedToken || receivedToken !== expectedToken) return json({ error: "Não autorizado." }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Configuração do servidor incompleta." }, 503);

  try {
    const payload = await request.json();
    const payment = payload?.payment;
    const checkout = payload?.checkout;
    const email = typeof payload?.customer?.email === "string" ? payload.customer.email.trim().toLowerCase() : "";
    if (!payment || payment.type !== "payment" || !payment.id || !checkout?.id || !Number.isInteger(payment.amount)) {
      return json({ received: true, ignored: true });
    }

    const statusMap: Record<string, string> = {
      paid: "approved",
      unpaid: "pending",
      credit_card_declined: "rejected",
      refunded: "refunded",
      chargedback: "chargedback",
    };
    const internalStatus = statusMap[String(payment.status)];
    if (!internalStatus) return json({ received: true, ignored: true });

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    let orderId: string | null = null;

    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id")
      .eq("payment_provider", "wiapy")
      .eq("provider_payment_id", String(payment.id))
      .maybeSingle();

    if (existingOrder) {
      orderId = existingOrder.id;
    } else if (email) {
      const { data: candidates } = await supabase
        .from("orders")
        .select("id")
        .eq("payment_provider", "wiapy")
        .eq("provider_checkout_id", String(checkout.id))
        .eq("amount_cents", payment.amount)
        .eq("customer_email", email)
        .in("payment_status", ["pending", "rejected"])
        .limit(2);
      if (candidates?.length === 1) orderId = candidates[0].id;
    }

    if (orderId) {
      const update: Record<string, unknown> = {
        payment_status: internalStatus,
        provider_payment_id: String(payment.id),
        updated_at: new Date().toISOString(),
      };
      if (internalStatus === "approved") update.paid_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(update).eq("id", orderId);
      if (error) return json({ error: "Falha ao atualizar o pedido." }, 500);
    }

    await supabase.from("wiapy_webhook_events").upsert({
      provider_payment_id: String(payment.id),
      provider_checkout_id: String(checkout.id),
      amount_cents: payment.amount,
      provider_status: String(payment.status),
      matched_order_id: orderId,
    }, { onConflict: "provider_payment_id" });

    // If zero or multiple pending orders match, no order is unlocked automatically.
    // The event is retained for safe manual reconciliation.
    return json({ received: true, matched: Boolean(orderId) });
  } catch {
    return json({ error: "Payload inválido." }, 400);
  }
});
