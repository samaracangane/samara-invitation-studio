import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Download, Mail, PackageCheck, RefreshCw, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/lib/supabase";

type CustomerAsset = { type: string; label: string; downloadUrl: string };
type CustomerOrder = {
  id: string;
  inviteName: string;
  amountCents: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
  assets: CustomerAsset[];
};

export const Route = createFileRoute("/minha-conta")({
  head: () => ({ meta: [{ title: "Minha conta — Samara’s Enchanted Invite" }] }),
  component: MinhaConta,
});

function MinhaConta() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session);
        setEmail(data.session?.user?.email ?? "");
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user?.email) setEmail(next.user.email);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  async function loadOrders() {
    if (!supabase) return;
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.functions.invoke("customer-orders", { body: {} });
    if (error || data?.error) {
      setMessage(data?.error ?? "Não foi possível carregar seus pedidos.");
      setOrders([]);
    } else {
      setOrders((data?.orders ?? []) as CustomerOrder[]);
      if (!data?.orders?.length) setMessage("Ainda não encontramos pedidos associados a este e-mail.");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session?.user) void loadOrders();
  }, [session]);

  async function sendAccessLink(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Enviando link de acesso...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: window.location.origin + "/minha-conta" },
    });
    setMessage(error ? error.message : "Enviamos um link para seu e-mail. Abra a mensagem para entrar na sua conta.");
  }

  if (!supabase) return <SiteLayout><main className="mx-auto max-w-xl px-5 py-16"><h1 className="font-display text-3xl">Minha conta</h1><p className="mt-3 text-muted-foreground">A conexão da loja precisa ser configurada.</p></main></SiteLayout>;

  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><Sparkles size={14}/> Área da cliente</span>
          <h1 className="mt-4 font-display text-4xl font-semibold">Minha conta</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Entre com o mesmo e-mail usado na compra para acompanhar seu pedido e baixar seu convite quando estiver pronto.</p>

          {!session ? (
            <form onSubmit={sendAccessLink} className="mt-7 space-y-4">
              <label className="block text-sm font-semibold">Seu e-mail
                <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"/>
              </label>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground"><Mail size={17}/> Enviar link de acesso</button>
              {message && <p role="status" className="rounded-xl bg-secondary p-3 text-sm text-primary">{message}</p>}
            </form>
          ) : (
            <section className="mt-7">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-secondary/60 p-4">
                <div><p className="text-xs text-muted-foreground">Conectada como</p><p className="text-sm font-semibold">{session.user.email}</p></div>
                <button onClick={() => void loadOrders()} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-2 text-xs font-semibold text-primary"><RefreshCw size={14}/> Atualizar</button>
              </div>
              <h2 className="mt-7 flex items-center gap-2 font-display text-2xl font-semibold"><PackageCheck size={22}/> Meus pedidos</h2>
              {loading ? <p className="mt-4 text-sm text-muted-foreground">Carregando pedidos...</p> : orders.length ? (
                <div className="mt-4 space-y-3">
                  {orders.map((order) => <article key={order.id} className="rounded-2xl border border-border/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><h3 className="font-semibold">{order.inviteName}</h3><p className="mt-1 text-xs text-muted-foreground">Pedido em {new Date(order.createdAt).toLocaleDateString("pt-BR")}</p></div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{order.paymentStatus === "approved" ? "Pagamento aprovado" : "Aguardando pagamento"}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{order.fulfillmentStatus === "delivered" ? "Seu convite está pronto!" : order.fulfillmentStatus === "in_progress" ? "Estamos preparando seu convite." : "Seu pedido está aguardando preparação."}</p>
                    {order.assets?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{order.assets.map((asset) => (
                      <a key={asset.type} href={asset.downloadUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Download size={16}/>{asset.label}</a>
                    ))}</div>}
                  </article>)}
                </div>
              ) : <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">{message || "Nenhum pedido encontrado."}</p>}
              <button onClick={() => void supabase?.auth.signOut()} className="mt-6 text-sm font-medium text-muted-foreground underline">Sair da conta</button>
            </section>
          )}
        </div>
      </main>
    </SiteLayout>
  );
}
