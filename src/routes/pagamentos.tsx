import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Link2, LogIn, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Offer = { id: string; price_cents: number; checkout_id: string; checkout_url: string; is_active: boolean };
const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos Wiapy — Samara’s Enchanted Invite" }] }),
  component: PaymentSettings,
});

function PaymentSettings() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [price, setPrice] = useState("");
  const [checkoutId, setCheckoutId] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase || !session?.user) { setAuthorized(false); setOffers([]); setChecking(false); return; }
      setChecking(true);
      const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (!admin) {
        setAuthorized(false);
        setMessage("Esta conta ainda não tem permissão administrativa.");
        setChecking(false);
        return;
      }
      setAuthorized(true);
      const { data: rows, error } = await supabase.from("wiapy_offers").select("id,price_cents,checkout_id,checkout_url,is_active").order("price_cents");
      if (!alive) return;
      if (error) setMessage(error.message);
      else setOffers((rows ?? []) as Offer[]);
      setChecking(false);
    }
    void load();
    return () => { alive = false; };
  }, [session]);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Enviando link de acesso...");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + "/admin/pagamentos" } });
    setMessage(error ? error.message : "Link enviado. Abra o e-mail neste mesmo dispositivo.");
  }

  async function saveOffer(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !authorized) return;
    const cents = Math.round(Number(price.replace(",", ".")) * 100);
    if (!Number.isSafeInteger(cents) || cents < 190 || !checkoutId.trim() || !/^https:\/\//i.test(checkoutUrl.trim())) {
      setMessage("Informe preço a partir de R$ 1,90, ID do checkout e link HTTPS da oferta.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("wiapy_offers").upsert({
      price_cents: cents,
      checkout_id: checkoutId.trim(),
      checkout_url: checkoutUrl.trim(),
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "price_cents" });
    setSaving(false);
    if (error) { setMessage(error.message); return; }
    setMessage("Oferta salva. Convites com este preço poderão usar este link.");
    setPrice(""); setCheckoutId(""); setCheckoutUrl("");
    const { data } = await supabase.from("wiapy_offers").select("id,price_cents,checkout_id,checkout_url,is_active").order("price_cents");
    setOffers((data ?? []) as Offer[]);
  }

  async function toggle(offer: Offer) {
    if (!supabase) return;
    const { error } = await supabase.from("wiapy_offers").update({ is_active: !offer.is_active, updated_at: new Date().toISOString() }).eq("id", offer.id);
    if (error) { setMessage(error.message); return; }
    setOffers((items) => items.map((item) => item.id === offer.id ? { ...item, is_active: !item.is_active } : item));
  }

  async function logout() {
    await supabase?.auth.signOut();
    setSession(null); setAuthorized(false); setOffers([]);
  }

  return (
    <main className="min-h-screen bg-[#f8f6fb] px-4 py-8 text-[#302342] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-700"><ArrowLeft size={16}/> Voltar ao painel administrativo</Link>
        <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-600">Configuração de pagamentos</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Ofertas Wiapy</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Cadastre uma faixa de preço por oferta. Assim, um único produto digital genérico na Wiapy pode atender vários convites, sem cadastrar cada convite como produto.</p>

          {!isSupabaseConfigured && <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">O Supabase ainda não está configurado neste ambiente.</div>}
          {checking && <p className="mt-5 text-sm text-slate-500">Verificando acesso...</p>}

          {!checking && !session && isSupabaseConfigured && (
            <form onSubmit={login} className="mt-6 space-y-3">
              <label className="block text-sm font-medium">E-mail do administrador
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border px-4 py-3"/>
              </label>
              <button className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white"><LogIn size={16}/> Enviar link de acesso</button>
            </form>
          )}

          {!checking && session && !authorized && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">A conta conectada não está na lista de administradores. Um responsável autorizado precisa conceder a permissão no Supabase.</p>}

          {authorized && (
            <>
              <div className="mt-6 flex justify-end"><button onClick={logout} className="text-xs text-slate-500 underline">Sair</button></div>
              <form onSubmit={saveOffer} className="mt-4 grid gap-3 rounded-2xl bg-violet-50/70 p-4 sm:grid-cols-2">
                <label className="text-sm font-medium">Preço (R$)
                  <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Ex.: 25,00" inputMode="decimal" className="mt-1 w-full rounded-xl border bg-white px-3 py-3"/>
                </label>
                <label className="text-sm font-medium">ID do checkout Wiapy
                  <input value={checkoutId} onChange={(event) => setCheckoutId(event.target.value)} placeholder="ID mostrado no painel" className="mt-1 w-full rounded-xl border bg-white px-3 py-3"/>
                </label>
                <label className="text-sm font-medium sm:col-span-2">Link da oferta Wiapy
                  <input value={checkoutUrl} onChange={(event) => setCheckoutUrl(event.target.value)} placeholder="https://..." type="url" className="mt-1 w-full rounded-xl border bg-white px-3 py-3"/>
                </label>
                <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2"><Save size={16}/>{saving ? "Salvando..." : "Salvar faixa de preço"}</button>
              </form>
              <h2 className="mt-8 font-display text-xl font-semibold">Faixas cadastradas</h2>
              <div className="mt-3 space-y-2">
                {offers.length ? offers.map((offer) => (
                  <div key={offer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{money(offer.price_cents)}</p>
                      <p className="truncate text-xs text-slate-500">Checkout: {offer.checkout_id}</p>
                      <a href={offer.checkout_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-violet-700 underline"><Link2 size={12}/> Abrir link da oferta</a>
                    </div>
                    <button onClick={() => toggle(offer)} className="inline-flex items-center gap-2 text-xs font-medium">{offer.is_active ? <><ToggleRight className="text-emerald-600"/> Ativa</> : <><ToggleLeft className="text-slate-400"/> Inativa</>}</button>
                  </div>
                )) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhuma faixa cadastrada.</p>}
              </div>
              <div className="mt-6 flex gap-2 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-900"><CircleAlert size={18} className="shrink-0"/> A Wiapy documenta até 10 ofertas por checkout. Use o mesmo ID do checkout para todas as faixas que pertencem ao mesmo checkout. Cada preço precisa usar o link próprio da respectiva oferta.</div>
            </>
          )}
          {message && <p role="status" className="mt-4 rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
          <div className="mt-6 flex items-start gap-2 border-t pt-4 text-xs leading-5 text-slate-500"><CheckCircle2 size={16} className="mt-0.5 shrink-0"/> O recebimento e a conta Wiapy precisam ser administrados por um responsável adulto autorizado. Não compartilhe senhas, tokens ou chaves secretas no chat.</div>
        </div>
      </div>
    </main>
  );
}
