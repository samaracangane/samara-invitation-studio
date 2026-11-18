import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return response({ error: "Método não permitido." }, 405);
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
    if (!orderId || !accessToken) return response({ error: "Acesso inválido." }, 400);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data: order } = await supabase.from("orders")
      .select("id,invite_id,invite_name,amount_cents,payment_status,access_token_hash")
      .eq("id", orderId).maybeSingle();
    if (!order || !order.access_token_hash || await sha256(accessToken) !== order.access_token_hash) {
      return response({ error: "Pedido não encontrado." }, 404);
    }
    return response({
      orderId: order.id,
      inviteId: order.invite_id,
      inviteName: order.invite_name,
      amountCents: order.amount_cents,
      status: order.payment_status,
      paid: order.payment_status === "approved",
    });
  } catch {
    return response({ error: "Não foi possível consultar o pedido." }, 500);
  }
});
