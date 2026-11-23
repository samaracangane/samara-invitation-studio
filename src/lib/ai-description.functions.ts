import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

type Input = { accessToken: string; theme: string; details: string; name: string; category: string; price: string };

export const generateDescription = createServerFn({ method: "POST" })
  .inputValidator((data: Input) => {
    if (!data?.accessToken || !data.theme?.trim()) throw new Error("Informe o tema do convite.");
    const cut = (v: string, n: number) => String(v ?? "").slice(0, n);
    return { accessToken: cut(data.accessToken, 4000), theme: cut(data.theme, 200), details: cut(data.details, 1500), name: cut(data.name, 200), category: cut(data.category, 60), price: cut(data.price, 20) };
  })
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] ?? "https://plgwbxdjynljffowkxqi.supabase.co";
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? "sb_publishable_phoycDCoQ2zsz4uiccdHRw_XQlTLTNR";
    const sb = createClient(url, key, { global: { headers: { Authorization: `Bearer ${data.accessToken}` } }, auth: { persistSession: false } });
    const { data: userData } = await sb.auth.getUser(data.accessToken);
    if (!userData.user) return { ok: false as const, error: "Entre novamente no painel." };
    const { data: admin } = await sb.from("admin_users").select("user_id").eq("user_id", userData.user.id).maybeSingle();
    if (!admin) return { ok: false as const, error: "Apenas a administradora pode gerar descrições." };
    try {
      const { generateInviteDescription } = await import("./ai-description.server");
      const text = await generateInviteDescription(data);
      if (!text) return { ok: false as const, error: "A IA não retornou texto. Tente outro tema." };
      return { ok: true as const, text };
    } catch (e: any) {
      const status = e?.statusCode ?? e?.status;
      const msg = status === 402 ? "Créditos de IA esgotados. Adicione créditos em Configurações → Planos e créditos."
        : status === 429 ? "Muitas solicitações agora. Aguarde um minuto e tente de novo."
        : "Não foi possível gerar a descrição agora.";
      console.error("ai description", status, e?.message);
      return { ok: false as const, error: msg };
    }
  });
