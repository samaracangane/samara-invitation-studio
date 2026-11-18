import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Sparkles, CreditCard } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCanvas } from "@/components/InviteCanvas";
import { mapSupabaseInvite, waLink } from "@/data/invites";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/convite/$id")({
  loader: async ({ params }) => {
    if (!supabase) throw notFound();
    const { data } = await supabase
      .from("invites")
      .select("slug,name,category,description,price,image_url,image_urls,video_url,fields")
      .eq("slug", params.id)
      .eq("is_active", true)
      .maybeSingle();
    if (!data) throw notFound();
    return { invite: mapSupabaseInvite(data) };
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
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [selectedImage, setSelectedImage] = useState(invite.image);
  const [eventName, setEventName] = useState("");
  const [eventAge, setEventAge] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventMessage, setEventMessage] = useState("");
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
      body: {
        inviteSlug: invite.id,
        customerEmail: customerEmail.trim().toLowerCase(),
        eventDetails: {
          celebrantName: eventName.trim(),
          age: eventAge.trim(),
          eventDate,
          eventTime,
          location: eventLocation.trim(),
          address: eventAddress.trim(),
          message: eventMessage.trim(),
        },
      },
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
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Personalize os dados da comemoração e receba a arte final preparada por nossa equipe após a confirmação do pagamento.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-base font-semibold">Dados da festa</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Preencha as informações que deverão aparecer no convite. Elas serão enviadas junto com seu pedido antes do pagamento.</p>
                </div>
                <label className="block text-sm font-semibold">Nome do aniversariante *
                  <input required value={eventName} onChange={(event) => setEventName(event.target.value)} maxLength={100} placeholder="Nome que aparecerá no convite" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                </label>
                <label className="block text-sm font-semibold">Idade que vai completar
                  <input value={eventAge} onChange={(event) => setEventAge(event.target.value)} maxLength={30} placeholder="Ex.: 5 anos" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">Data da festa *
                    <input required type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                  </label>
                  <label className="block text-sm font-semibold">Horário *
                    <input required type="time" value={eventTime} onChange={(event) => setEventTime(event.target.value)} className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                  </label>
                </div>
                <label className="block text-sm font-semibold">Local da festa *
                  <input required value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} maxLength={160} placeholder="Ex.: Salão de festas, sítio, buffet..." className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                </label>
                <label className="block text-sm font-semibold">Endereço completo
                  <input value={eventAddress} onChange={(event) => setEventAddress(event.target.value)} maxLength={240} placeholder="Rua, número, bairro e cidade" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                </label>
                <label className="block text-sm font-semibold">Observações ou mensagem extra
                  <textarea value={eventMessage} onChange={(event) => setEventMessage(event.target.value)} maxLength={500} rows={3} placeholder="Informações adicionais para colocar no convite..." className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
                </label>
                <label className="block text-sm font-semibold">WhatsApp com DDD *\n                  <input required type="tel" inputMode="tel" autoComplete="tel" value={customerWhatsapp} onChange={(event) => setCustomerWhatsapp(event.target.value)} maxLength={20} placeholder="(11) 99999-9999" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/><span className="mt-1 block text-xs text-muted-foreground">Obrigatório para contato sobre seu pedido.</span>\n                </label>\n                <label className="block text-sm font-semibold">Seu e-mail *
                  <input required type="email" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} placeholder="voce@exemplo.com" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/><span className="mt-1 block text-xs text-muted-foreground">Use o mesmo e-mail no checkout Wiapy para identificarmos seu pagamento.</span>
                </label>
              </div>
              <button type="button" onClick={startCheckout} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                <CreditCard className="h-4 w-4"/>{busy ? "Preparando pagamento..." : "Comprar e personalizar"}
              </button>
              {notice && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{notice}</p>}
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
