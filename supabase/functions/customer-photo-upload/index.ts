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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (request.method !== "POST") return response({ error: "Método não permitido." }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!authorization || !supabaseUrl || !anonKey || !serviceKey) {
      return response({ error: "Acesso não configurado." }, 401);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    const email = userData.user?.email?.trim().toLowerCase();
    if (userError || !email) return response({ error: "Entre na sua conta para enviar a foto." }, 401);

    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return response({ error: "Pedido inválido." }, 400);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: order } = await admin.from("orders").select("id")
      .eq("id", orderId).ilike("customer_email", email)
      .eq("payment_status", "approved").maybeSingle();
    if (!order) return response({ error: "Pedido não encontrado ou ainda não pago." }, 404);

    const path = order.id + "/customer-photo";
    const { data: signed, error: signError } = await admin.storage
      .from("customer-uploads").createSignedUploadUrl(path, { upsert: true });
    if (signError || !signed) return response({ error: "Não foi possível preparar o envio da foto." }, 500);

    const { error: updateError } = await admin.from("orders")
      .update({ customer_photo_path: path }).eq("id", order.id);
    if (updateError) return response({ error: "Não foi possível vincular a foto ao pedido." }, 500);

    return response({ path, token: signed.token });
  } catch {
    return response({ error: "Não foi possível preparar o envio da foto." }, 500);
  }
});
