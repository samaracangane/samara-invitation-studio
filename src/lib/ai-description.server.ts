import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const RUN_ID = "X-Lovable-AIG-Run-ID";

export async function generateInviteDescription(input: { theme: string; details: string; name: string; category: string; price: string }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("A geração com IA não está configurada.");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (url, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN_ID, runId);
      const res = await fetch(url, { ...init, headers });
      runId ??= res.headers.get(RUN_ID) ?? undefined;
      return res;
    },
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6.1-sol"),
    maxRetries: 0,
    system:
      "Você é redatora de uma loja brasileira de convites digitais (Samara Criar Art's Convites). Escreva descrições de produto em português do Brasil, calorosas e persuasivas, que façam a cliente querer comprar. Use 2 parágrafos curtos e depois 3 a 5 linhas começando com '✨ ' destacando benefícios (personalização, entrega digital pelo celular, fácil de compartilhar). Não invente prazos, descontos, garantias nem informações que não foram dadas. Sem markdown, sem títulos, sem hashtags.",
    messages: [{
      role: "user",
      content: `Tema: ${input.theme}\nNome do convite: ${input.name || "(sem nome)"}\nCategoria: ${input.category}\nPreço: R$ ${input.price}\nDetalhes: ${input.details || "(nenhum)"}`,
    }],
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  let text = "";
  for await (const part of result.fullStream) {
    if (part.type === "text-delta") text += part.text;
    if (part.type === "error") throw part.error;
  }
  return text.trim();
}
