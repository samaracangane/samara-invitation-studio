import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, FileImage, FileText, FileVideo, LogOut, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

type OrderRow = {
  id: string;
  invite_name: string;
  customer_email: string | null;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
};

const deliveryTypes = {
  video: { label: "MP4", column: "final_video_path", extension: "mp4", mime: "video/mp4", max: 100 * 1024 * 1024 },
  image: { label: "Imagem", column: "final_image_path", extension: "jpg", mime: ["image/jpeg", "image/png", "image/webp"], max: 20 * 1024 * 1024 },
  pdf: { label: "PDF", column: "final_pdf_path", extension: "pdf", mime: "application/pdf", max: 20 * 1024 * 1024 },
} as const;

type DeliveryKind = keyof typeof deliveryTypes;

export const Route = createFileRoute("/admin-pedidos")({
  head: () => ({ meta: [{ title: "Entregas de convites — Samara’s Enchanted Invite" }] }),
  component: AdminPedidos,
});

function AdminPedidos() {
  const [session, setSession] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase || !session?.user) { setAuthorized(false); setLoading(false); return; }
      setLoading(true);
      const { data: admin } = await supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (!admin) { setAuthorized(false); setLoading(false); setMessage("Esta conta não tem permissão administrativa."); return; }
      setAuthorized(true);
      const { data, error } = await supabase.from("orders")
        .select("id,invite_name,customer_email,payment_status,fulfillment_status,created_at")
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error) setMessage("Não foi possível carregar os pedidos. Confira se a migração da área do cliente foi aplicada.");
      else setOrders((data ?? []) as OrderRow[]);
      setLoading(false);
    }
    void load();
    return () => { alive = false; };
  }, [session]);

  async function deliver(order: OrderRow, kind: DeliveryKind, file?: File) {
    if (!supabase || !file) return;
    const config = deliveryTypes[kind];
    const validMime = Array.isArray(config.mime) ? config.mime.includes(file.type) : file.type === config.mime;
    if (!validMime) { setMessage(kind === "image" ? "Selecione uma imagem JPG, PNG ou WEBP." : "Formato de arquivo inválido."); return; }
    if (file.size > config.max) { setMessage(kind === "video" ? "O vídeo deve ter até 100 MB." : "A imagem ou PDF deve ter até 20 MB."); return; }
    setBusyId(order.id); setMessage("");
    const extension = kind === "image" ? (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg") : config.extension;
    const path = order.id + "." + extension;
    const { error: uploadError } = await supabase.storage.from("customer-deliveries").upload(path, file, {
      upsert: true, contentType: file.type,
    });
    if (uploadError) {
      setMessage("Não foi possível enviar o arquivo: " + uploadError.message);
      setBusyId("");
      return;
    }
    const { error: updateError } = await supabase.from("orders").update({
      [config.column]: path,
      fulfillment_status: "delivered",
      fulfilled_at: new Date().toISOString(),
    }).eq("id", order.id);
    if (updateError) setMessage("O arquivo foi enviado, mas o pedido não foi atualizado. Peça ajuda ao suporte técnico.");
    else {
      setOrders((current) => current.map((item) => item.id === order.id
        ? { ...item, fulfillment_status: "delivered" } : item));
      setMessage(config.label + " enviado para a área da cliente.");
    }
    setBusyId("");
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f6fc] text-[#51436b]">Carregando pedidos...</main>;
  if (!supabase || !session || !authorized) return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-3xl">Entregas de convites</h1>
      <p className="mt-3 text-sm text-muted-foreground">{message || "Entre primeiro no painel administrativo para acessar esta página."}</p>
      <a href="/admin" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"><ArrowLeft size={16}/> Ir para o painel</a>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f8f6fc] px-4 py-8 text-[#302342] sm:px-7">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Painel administrativo</p><h1 className="mt-1 font-display text-3xl font-semibold">Pedidos e entregas</h1><p className="mt-2 text-sm text-slate-500">Envie o convite pronto em vídeo, imagem ou PDF. A cliente verá os arquivos na área Minha conta.</p></div>
          <div className="flex gap-2"><a href="/admin" className="rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700">Voltar ao painel</a><button onClick={() => void supabase.auth.signOut()} className="rounded-full border border-violet-200 bg-white p-2 text-violet-700" aria-label="Sair"><LogOut size={17}/></button></div>
        </header>
        {message && <p role="status" className="mt-5 rounded-xl bg-white p-4 text-sm text-violet-800 shadow-sm">{message}</p>}
        <section className="mt-6 space-y-3">
          {orders.map((order) => <article key={order.id} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-semibold">{order.invite_name}</h2><p className="mt-1 text-sm text-slate-500">{order.customer_email || "E-mail não informado"}</p><p className="mt-1 text-xs text-slate-400">Pedido {new Date(order.created_at).toLocaleDateString("pt-BR")}</p></div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{order.payment_status === "approved" ? "Pago" : order.payment_status}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {order.payment_status === "approved" ? (
                <>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white opacity-100">
                    <FileVideo size={16}/> Enviar MP4
                    <input type="file" accept="video/mp4" className="hidden" disabled={Boolean(busyId)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void deliver(order, "video", file); event.currentTarget.value = ""; }}/>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-800">
                    <FileImage size={16}/> Enviar imagem
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={Boolean(busyId)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void deliver(order, "image", file); event.currentTarget.value = ""; }}/>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-800">
                    <FileText size={16}/> Enviar PDF
                    <input type="file" accept="application/pdf" className="hidden" disabled={Boolean(busyId)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void deliver(order, "pdf", file); event.currentTarget.value = ""; }}/>
                  </label>
                  {busyId === order.id && <span className="self-center text-xs text-slate-500">Enviando arquivo...</span>}
                </>
              ) : <span className="text-xs text-slate-400">Disponível após pagamento aprovado</span>}
            </div>
          </article>)}
          {!orders.length && <div className="rounded-2xl border border-dashed border-violet-200 bg-white p-12 text-center text-sm text-slate-500">Ainda não há pedidos.</div>}
        </section>
      </div>
    </main>
  );
}
