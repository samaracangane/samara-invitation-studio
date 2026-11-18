import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, WandSparkles, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCanvas } from "@/components/InviteCanvas";
import { getInvite, mapSupabaseInvite, waLink } from "@/data/invites";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/convite/$id")({
  loader: async ({ params }) => {
    if (supabase) {
      const { data } = await supabase
        .from("invites")
        .select("slug,name,category,description,price,image_url,video_url,fields")
        .eq("slug", params.id)
        .eq("is_active", true)
        .maybeSingle();
      if (data) return { invite: mapSupabaseInvite(data) };
    }
    const invite = getInvite(params.id);
    if (!invite) throw notFound();
    return { invite };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.invite.name + " — Samara’s Enchanted Invite" },
          { name: "description", content: loaderData.invite.description },
          { property: "og:title", content: loaderData.invite.name + " — Samara’s Enchanted Invite" },
          { property: "og:description", content: loaderData.invite.description },
        ]
      : [{ title: "Convite não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  component: InviteProduct,
});

function InviteProduct() {
  const { invite } = Route.useLoaderData();
  const [customerEmail, setCustomerEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function startCheckout() {
    if (!supabase) {
      setNotice("O pagamento ainda não está conectado ao banco de dados.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setNotice("Digite um e-mail válido para localizar seu pedido depois do pagamento.");
      return;
    }
    setBusy(true);
    setNotice("");
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { inviteSlug: invite.id, customerEmail: customerEmail.trim().toLowerCase() },
    });
    setBusy(false);
    if (error || !data?.checkoutUrl || !data?.orderId || !data?.accessToken) {
      setNotice(data?.error || error?.message || "Não foi possível iniciar o pagamento. Verifique se o checkout está configurado.");
      return;
    }
    const saved = { orderId: data.orderId, accessToken: data.accessToken, inviteId: invite.id };
    localStorage.setItem("samara-order:" + data.orderId, JSON.stringify(saved));
    localStorage.setItem("samara-last-order", JSON.stringify(saved));
    window.location.assign(data.checkoutUrl);
  }

  const pedido = "Olá! Quero informações sobre o convite " + invite.name + ".";

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <Link to="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles className="h-3.5 w-3.5"/> Convite personalizável</span>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{invite.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{invite.description}</p>
        </div>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-10">
          <section className="rounded-3xl border border-border/70 bg-card p-3 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Prévia do convite</p><p className="mt-1 text-xs text-muted-foreground">{invite.video ? "Modelo animado" : "Modelo em imagem"}</p></div>
              {invite.video && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">Vídeo</span>}
            </div>
            <div className="mx-auto max-w-[340px] overflow-hidden rounded-2xl bg-muted">
              <InviteCanvas image={invite.image} video={invite.video} fields={invite.fields}/>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">A arte final será liberada após a confirmação do pagamento.</p>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Investimento</p>
              <p className="mt-2 font-display text-3xl font-semibold">{invite.price}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Personalize os dados da comemoração e finalize seu convite no editor online.</p>
              <label className="mt-6 block text-sm font-semibold">Seu e-mail
                <input type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="voce@exemplo.com" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/><span className="mt-1 block text-xs text-muted-foreground">Use o mesmo e-mail no checkout Wiapy para identificarmos seu pagamento.</span>
              </label>
              <button type="button" onClick={startCheckout} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                <CreditCard className="h-4 w-4"/>{busy ? "Preparando pagamento..." : "Comprar e personalizar"}
              </button>
              {notice && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{notice}</p>}
              <a href={"/editor?invite=" + encodeURIComponent(invite.id)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/30 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-secondary"><WandSparkles className="h-4 w-4"/> Experimentar editor (prévia)</a>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">A prévia do editor permite testar as ferramentas. A exportação e o salvamento na conta serão liberados somente após a confirmação do pedido.</p>
            </div>
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
              <h2 className="font-display text-xl font-semibold">Prefere tirar dúvidas?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Fale com a equipe antes de finalizar sua compra.</p>
              <a href={waLink(pedido)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90">Continuar pelo WhatsApp</a>
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
