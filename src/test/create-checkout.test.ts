import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const source = readFileSync("supabase/functions/create-checkout/index.ts", "utf8");
const executable = ts.transpile(source.replace(/^import .*\n/, ""), {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.None,
});

async function checkout(eventDetails?: unknown, whatsapp = "11 99999-9999") {
  let handler: ((request: Request) => Promise<Response>) | undefined;
  let inserted: Record<string, unknown> | undefined;
  const client = {
    from(table: string) {
      const chain = {
        select: () => chain,
        eq: () => chain,
        maybeSingle: async () => ({
          data: table === "invites"
            ? { slug: "test-invite", name: "Test invite", price: 10, is_active: true }
            : { id: "test-offer", checkout_id: "test-checkout", checkout_url: "https://example.com/checkout" },
          error: null,
        }),
        insert: (row: Record<string, unknown>) => { inserted = row; return chain; },
        single: async () => ({ data: { id: "test-order" }, error: null }),
      };
      return chain;
    },
  };
  new Function("createClient", "Deno", "crypto", executable)(
    () => client,
    { env: { get: () => "test-config" }, serve: (callback: typeof handler) => { handler = callback; } },
    webcrypto,
  );
  if (!handler) throw new Error("Checkout handler was not registered");
  const response = await handler(new Request("https://example.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inviteSlug: "test-invite", customerEmail: "checkout@example.com", customerWhatsapp: whatsapp, eventDetails }),
  }));
  return { response, inserted };
}

describe("create-checkout regression", () => {
  it("creates an order with the submitted party details instead of throwing a ReferenceError", async () => {
    const details = { celebrantName: "Samara", eventDate: "2026-12-20", eventTime: "18:00", location: "Salão" };
    const { response, inserted } = await checkout(details);
    expect(response.status).toBe(200);
    expect(inserted?.['event_details']).toEqual(details);
    expect(await response.json()).toMatchObject({ orderId: "test-order", checkoutUrl: "https://example.com/checkout" });
  });

  it.each([undefined, null, "invalid", []])("handles absent or non-object party details (%j)", async (details) => {
    const { response, inserted } = await checkout(details);
    expect(response.status).toBe(200);
    expect(inserted?.['event_details']).toEqual({});
  });

  it("rejects a checkout without a WhatsApp number", async () => {
    const { response, inserted } = await checkout({ celebrantName: "Samara" }, "");
    expect(response.status).toBe(400);
    expect(inserted).toBeUndefined();
    expect(await response.json()).toMatchObject({ error: "Informe um convite válido, e-mail e WhatsApp com DDD." });
  });
});