import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";
import { getPaymentStatus } from "@/lib/asaas.functions";

type SavedOrder = { orderId: string; accessToken: string; inviteId: string };
type OrderState = { status: string; inviteId: string; inviteName: string; amountCents: number };

export const Route = createFileRoute("/retorno")({
  head: () => ({ meta: [{ title: "Status do pedido — Samara Criar Art's Convites" }] }),
  component: ReturnPage,
});

function ReturnPage() {
  const [saved, setSaved] = useState<SavedOrder | null>(null);
  const [order, setOrder] = useState<OrderState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Localizando seu pedido...");

  async function checkOrder(current = saved) {
    if (!current) {
      setMessage("Não encontramos um pedido salvo neste navegador.");
      return;
    }
    setBusy(true);
    try {
      const data = await getPaymentStatus({ data: { orderId: current.orderId, accessToken: current.accessToken, manual: true } });
      setOrder(data as OrderState);
      setMessage(data.status === "approved" ? "Pagamento confirmado! Seu editor está liberado." : "Ainda estamos aguardando a confirmação do pagamento.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível consultar o pedido. Tente novamente mais tarde.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("samara-last-order");
      if (!raw) { setMessage("Não encontramos um pedido salvo neste navegador."); return; }
      const current = JSON.parse(raw) as SavedOrder;
      setSaved(current);
      void checkOrder(current);
    } catch {
      setMessage("Não foi possível recuperar os dados deste pedido.");
    }
  }, []);

  const paid = order?.status === "approved";
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f6fb] px-4 py-10 text-[#302342]">
      <section className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white p-7 text-center shadow-sm sm:p-10">
        {paid ? <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600"/> : order && order.status !== "pending" ? <XCircle className="mx-auto h-14 w-14 text-rose-500"/> : <Clock3 className="mx-auto h-14 w-14 text-amber-500"/>}
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-violet-600">Samara Criar Art's Convites</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">{paid ? "Tudo certo!" : "Conferindo pagamento"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        {order && <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm"><p className="font-semibold">{order.inviteName}</p><p className="mt-1 text-slate-500">Valor: {(order.amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p><p className="mt-1 text-xs text-slate-500">Status: {order.status}</p></div>}
        {paid && saved && <a href={"/editor?order=" + encodeURIComponent(saved.orderId)} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-violet-700 px-5 py-3.5 text-sm font-semibold text-white">Abrir meu editor</a>}
        {!paid && <button onClick={() => void checkOrder()} disabled={busy || !saved} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-700 px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-50"><RefreshCw size={16} className={busy ? "animate-spin" : ""}/> {busy ? "Consultando..." : "Consultar novamente"}</button>}
        <Link to="/" className="mt-5 inline-flex text-sm text-violet-700 underline">Voltar à loja</Link>
      </section>
    </main>
  );
}
