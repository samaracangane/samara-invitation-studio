import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function makeToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return response({ error: "Método não permitido." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) return response({ error: "Configuração do servidor incompleta." }, 503);

    const body = await request.json();
    const inviteSlug = typeof body.inviteSlug === "string" ? body.inviteSlug.trim() : "";
    const email = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";
    const whatsapp = typeof body.customerWhatsapp === "string" ? body.customerWhatsapp.trim() : "";
    const eventDetails = body.eventDetails && typeof body.eventDetails === "object" && !Array.isArray(body.eventDetails)
      ? body.eventDetails
      : {};
    if (!inviteSlug || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[0-9()\s-]{10,20}$/.test(whatsapp)) {
      return response({ error: "Informe um convite válido, e-mail e WhatsApp com DDD." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("slug,name,price,is_active,image_url")
      .eq("slug", inviteSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (inviteError || !invite) return response({ error: "Este convite ainda não está cadastrado no catálogo de vendas." }, 404);
    const amountCents = Math.round(Number(invite.price) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents < 190) {
      return response({ error: "O preço deste convite ainda não está configurado para venda." }, 409);
    }

    const { data: offer, error: offerError } = await supabase
      .from("wiapy_offers")
      .select("id,checkout_id,checkout_url")
      .eq("price_cents", amountCents)
      .eq("is_active", true)
      .maybeSingle();

    if (offerError || !offer) {
      return response({ error: "Ainda não existe uma oferta Wiapy ativa para o preço deste convite. Configure a faixa de preço no painel administrativo." }, 409);
    }

    const accessToken = makeToken();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        invite_id: invite.slug,
        invite_name: invite.name,
        invite_image_url: invite.image_url ?? null,
        amount_cents: amountCents,
        currency: "BRL",
        customer_email: email,
        customer_whatsapp: whatsapp,
        event_details: eventDetails,
        payment_provider: "wiapy",
        provider_checkout_id: offer.checkout_id,
        checkout_url: offer.checkout_url,
        offer_id: offer.id,
        payment_status: "pending",
        idempotency_key: crypto.randomUUID(),
        access_token_hash: await sha256(accessToken),
      })
      .select("id")
      .single();

    if (orderError || !order) return response({ error: "Não foi possível criar o pedido. Tente novamente." }, 500);

    return response({
      orderId: order.id,
      accessToken,
      checkoutUrl: offer.checkout_url,
      amountCents,
      inviteName: invite.name,
    });
  } catch {
    return response({ error: "Não foi possível iniciar o checkout." }, 500);
  }
});
