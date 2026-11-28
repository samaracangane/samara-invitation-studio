import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, LogIn, RefreshCw, ShieldCheck, Webhook } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { asaasAdminAction } from "@/lib/asaas.functions";

type AsaasStatus = {
  accountStatus: string;
  bankStatus: string;
  webhookActive: boolean;
};

export const Route = createFileRoute("/pagamentos")({
  head: () => ({ meta: [{ title: "Pagamentos Asaas — Samara Studio Arts" }] }),
  component: PaymentSettings,
});

function PaymentSettings() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState<"status" | "webhook" | "reconcile" | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<AsaasStatus | null>(null);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function verifyAdmin() {
      if (!supabase || !session?.user) {
        setAuthorized(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      const { data, error } = await supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      setAuthorized(Boolean(data && !error));
      if (error || !data) setMessage("Esta conta ainda não tem permissão administrativa.");
      setChecking(false);
    }
    void verifyAdmin();
    return () => { alive = false; };
  }, [session]);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Enviando link de acesso...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/pagamentos" },
    });
    setMessage(error ? error.message : "Link enviado. Abra o e-mail neste mesmo dispositivo.");
  }

  async function runAction(action: "status" | "webhook" | "reconcile") {
    setBusy(action);
    setMessage("");
    try {
      const result = await asaasAdminAction({ data: { action } });
      setStatus(result);
      if (action === "webhook") setMessage("Solicitação de ativação do webhook concluída. Confira o status abaixo.");
      else if (action === "reconcile") setMessage("Reconciliação concluída. Os pedidos elegíveis foram consultados.");
      else setMessage("Status da conexão consultado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir a operação. Confira a configuração do servidor.");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    setSession(null);
    setAuthorized(false);
    setStatus(null);
  }

  return (
    <main className="min-h-screen bg-[#f8f6fb] px-4 py-8 text-[#302342] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-violet-700"><ArrowLeft size={16}/> Voltar ao painel administrativo</Link>
        <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-600">Configuração de pagamentos</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Integração Asaas</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Consulte a conexão, ative o webhook de confirmação e execute a reconciliação de pedidos. As credenciais ficam exclusivamente nos secrets do servidor.</p>

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

          {!checking && session && !authorized && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">A conta conectada não está na lista de administradores.</p>}

          {authorized && (
            <>
              <div className="mt-6 flex justify-end"><button onClick={logout} className="text-xs text-slate-500 underline">Sair</button></div>
              <section className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-violet-700"/><h2 className="font-semibold">Operações seguras</h2></div>
                <p className="mt-2 text-sm leading-6 text-slate-600">Nenhuma dessas ações cria uma cobrança. A reconciliação apenas consulta pagamentos existentes e atualiza pedidos que correspondam ao valor e à referência registrados.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <button type="button" disabled={busy !== null} onClick={() => void runAction("status")} className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={15} className={busy === "status" ? "animate-spin" : ""}/>{busy === "status" ? "Consultando..." : "Consultar status"}</button>
                  <button type="button" disabled={busy !== null} onClick={() => void runAction("webhook")} className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"><Webhook size={15}/>{busy === "webhook" ? "Ativando..." : "Configurar webhook"}</button>
                  <button type="button" disabled={busy !== null} onClick={() => void runAction("reconcile")} className="inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-violet-700 disabled:opacity-50"><RefreshCw size={15} className={busy === "reconcile" ? "animate-spin" : ""}/>{busy === "reconcile" ? "Verificando..." : "Reconciliar pedidos"}</button>
                </div>
              </section>

              {status && <section className="mt-5 rounded-2xl border border-slate-100 p-4">
                <h2 className="font-semibold">Resultado da verificação</h2>
                <div className="mt-3 space-y-3 text-sm">
                  <p className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600"/> Conexão consultada: {status.accountStatus}</p>
                  <p className="flex items-start gap-2"><CircleAlert size={17} className="mt-0.5 shrink-0 text-amber-600"/> Situação bancária: {status.bankStatus}</p>
                  <p className="flex items-center gap-2">{status.webhookActive ? <CheckCircle2 size={17} className="text-emerald-600"/> : <CircleAlert size={17} className="text-amber-600"/>} Webhook: {status.webhookActive ? "ativo" : "ainda não está ativo"}</p>
                </div>
              </section>}

              <div className="mt-6 rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-900">
                <p className="font-semibold">Antes de ativar em produção</p>
                <p className="mt-1">Configure os secrets necessários no ambiente de hospedagem e no Asaas. Nunca cole chaves de API, tokens de webhook, CPF ou dados bancários no chat ou no código-fonte. Faça primeiro a validação em ambiente de testes.</p>
              </div>
            </>
          )}

          {message && <p role="status" className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{message}</p>}
        </div>
      </div>
    </main>
  );
}
