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
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!authorization || !supabaseUrl || !anonKey || !serviceKey) {
      return response({ error: "Acesso administrativo não configurado." }, 401);
    }
    if (!lovableKey) {
      return response({ error: "O AI Gateway ainda não está configurado neste projeto. Peça ao Lovable para habilitar o conector de IA e criar o segredo LOVABLE_API_KEY no Supabase." }, 503);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return response({ error: "Faça login no painel administrativo." }, 401);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: adminRow, error: adminError } = await admin
      .from("admin_users")
      .select("user_id")
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (adminError || !adminRow) return response({ error: "Apenas administradores podem gerar descrições." }, 403);

    const body = await request.json();
    const theme = typeof body.theme === "string" ? body.theme.trim().slice(0, 120) : "";
    const occasion = typeof body.occasion === "string" ? body.occasion.trim().slice(0, 80) : "";
    const age = typeof body.age === "string" ? body.age.trim().slice(0, 40) : "";
    const colors = typeof body.colors === "string" ? body.colors.trim().slice(0, 120) : "";
    const details = typeof body.details === "string" ? body.details.trim().slice(0, 500) : "";

    if (!theme || !occasion) return response({ error: "Informe pelo menos o tema e a ocasião do convite." }, 400);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-lite",
        temperature: 0.7,
        max_tokens: 420,
        messages: [
          {
            role: "system",
            content: "Você é redatora de e-commerce especializada em convites digitais em português do Brasil. Escreva descrições curtas, encantadoras e persuasivas, com foco nos benefícios emocionais e clareza. Não invente características do produto, formatos, prazos, personalização, entrega ou recursos que não foram informados. Não prometa resultados. Use no máximo 2 emojis, linguagem natural, um título curto e 2 parágrafos breves com uma chamada para escolher o convite. Retorne somente a descrição pronta para a loja, sem explicar seu processo."
          },
          {
            role: "user",
            content: JSON.stringify({ tema: theme, ocasiao: occasion, idade: age || "Não informada", cores: colors || "Não informadas", detalhes_confirmados: details || "Nenhum detalhe adicional informado", instrucoes: "Crie uma descrição atraente sem acrescentar informações não fornecidas." })
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI Gateway error:", aiResponse.status, errorText.slice(0, 500));
      if (aiResponse.status === 402) return response({ error: "Os créditos de IA do Lovable acabaram. Verifique o painel de uso de IA." }, 402);
      if (aiResponse.status === 429) return response({ error: "Muitas solicitações em sequência. Aguarde um pouco e tente novamente." }, 429);
      return response({ error: "A IA não conseguiu gerar a descrição agora. Tente novamente." }, 502);
    }

    const result = await aiResponse.json();
    const description = result?.choices?.[0]?.message?.content;
    if (typeof description !== "string" || !description.trim()) {
      return response({ error: "A IA retornou uma descrição vazia. Tente novamente." }, 502);
    }

    return response({ description: description.trim() });
  } catch (error) {
    console.error("generate-invite-description:", error);
    return response({ error: "Não foi possível gerar a descrição. Tente novamente." }, 500);
  }
});
