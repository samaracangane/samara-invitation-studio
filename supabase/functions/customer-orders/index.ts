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
    if (userError || !email) return response({ error: "Entre pelo link enviado ao seu e-mail." }, 401);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { data: orders, error } = await admin
      .from("orders")
      .select("id,invite_name,amount_cents,payment_status,fulfillment_status,created_at,final_video_path,final_image_path,final_pdf_path,customer_photo_path")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) return response({ error: "Não foi possível carregar seus pedidos." }, 500);

    const result = await Promise.all((orders ?? []).map(async (order) => {
      const assets: { type: string; label: string; downloadUrl: string }[] = [];
      let customerPhotoUrl: string | null = null;
      if (order.customer_photo_path && order.payment_status === "approved") {
        const { data: photo } = await admin.storage.from("customer-uploads")
          .createSignedUrl(order.customer_photo_path, 60 * 60);
        customerPhotoUrl = photo?.signedUrl ?? null;
      }
      if (order.payment_status === "approved") {
        const candidates = [
          { path: order.final_video_path, type: "video", label: "Baixar convite MP4" },
          { path: order.final_image_path, type: "image", label: "Baixar imagem" },
          { path: order.final_pdf_path, type: "pdf", label: "Baixar PDF" },
        ];
        for (const asset of candidates) {
          if (!asset.path) continue;
          const { data } = await admin.storage.from("customer-deliveries")
            .createSignedUrl(asset.path, 60 * 60, { download: true });
          if (data?.signedUrl) assets.push({ type: asset.type, label: asset.label, downloadUrl: data.signedUrl });
        }
      }
      return {
        id: order.id,
        inviteName: order.invite_name,
        amountCents: order.amount_cents,
        paymentStatus: order.payment_status,
        fulfillmentStatus: order.fulfillment_status,
        createdAt: order.created_at,
        customerPhotoUrl,
        assets,
      };
    }));

    return response({ orders: result });
  } catch {
    return response({ error: "Não foi possível consultar seus pedidos." }, 500);
  }
});
