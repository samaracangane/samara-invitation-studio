import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LogOut, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type InviteRow = {
  id: string;
  slug: string;
  name: string;
  category: "Infantil" | "Casamento" | "15 Anos";
  description: string;
  price: number;
  image_url: string | null;
  video_url: string | null;
  is_active: boolean;
};

type Draft = {
  id?: string;
  slug: string;
  name: string;
  category: "Infantil" | "Casamento" | "15 Anos";
  description: string;
  price: string;
  image_url: string;
  video_url: string;
  is_active: boolean;
};

const emptyDraft = (): Draft => ({
  slug: "", name: "", category: "Infantil", description: "",
  price: "25", image_url: "", video_url: "", is_active: true,
});

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — Samara Criar Art's" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState("samaracangane6@gmail.com");
  const [session, setSession] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<InviteRow[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    let alive = true;
    async function verify() {
      if (!supabase || !session?.user) {
        setAuthorized(false); setRows([]); setChecking(false); return;
      }
      setChecking(true);
      const { data, error } = await supabase.from("admin_users")
        .select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (error || !data) {
        setAuthorized(false);
        setMessage("Este e-mail ainda não foi liberado como administrador. Conclua a configuração indicada no painel Supabase.");
      } else {
        setAuthorized(true); setMessage("");
        const { data: invites, error: listError } = await supabase.from("invites")
          .select("id,slug,name,category,description,price,image_url,video_url,is_active")
          .order("created_at", { ascending: false });
        if (alive) {
          if (listError) setMessage(listError.message);
          else setRows((invites ?? []) as InviteRow[]);
        }
      }
      if (alive) setChecking(false);
    }
    void verify();
    return () => { alive = false; };
  }, [session]);

  async function sendLoginLink(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Enviando link de acesso...");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setMessage(error ? error.message : "Enviamos um link de acesso para seu e-mail. Abra-o neste dispositivo.");
  }

  async function uploadFile(file: File, kind: "image" | "video") {
    if (!supabase || !session?.user) return;
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const path = `${session.user.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("invite-media").upload(path, file, { upsert: true });
    if (error) { setMessage(error.message); return; }
    const { data } = supabase.storage.from("invite-media").getPublicUrl(path);
    setDraft((current) => ({ ...current, [kind === "image" ? "image_url" : "video_url"]: data.publicUrl }));
    setMessage(kind === "image" ? "Imagem enviada." : "Vídeo enviado.");
  }

  async function saveInvite(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true); setMessage("");
    const payload = {
      slug: draft.slug.trim() || draft.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: draft.name.trim(), category: draft.category, description: draft.description.trim(),
      price: Number(draft.price), image_url: draft.image_url || null, video_url: draft.video_url || null,
      is_active: draft.is_active,
    };
    const result = draft.id
      ? await supabase.from("invites").update(payload).eq("id", draft.id)
      : await supabase.from("invites").insert(payload);
    setSaving(false);
    if (result.error) { setMessage(result.error.message); return; }
    setDraft(emptyDraft()); setMessage("Convite salvo com sucesso.");
    const { data } = await supabase.from("invites")
      .select("id,slug,name,category,description,price,image_url,video_url,is_active")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as InviteRow[]);
  }

  async function removeInvite(id: string) {
    if (!supabase || !window.confirm("Deseja excluir este convite?")) return;
    const { error } = await supabase.from("invites").delete().eq("id", id);
    if (error) setMessage(error.message);
    else { setRows((current) => current.filter((row) => row.id !== id)); setMessage("Convite excluído."); }
  }

  if (!isSupabaseConfigured) return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-4xl">Área administrativa</h1>
      <p className="mt-4 text-muted-foreground">A conexão com o Supabase ainda precisa ser configurada nas variáveis de ambiente do projeto.</p>
    </main>
  );

  if (checking) return <main className="mx-auto max-w-xl px-5 py-16">Carregando administração...</main>;

  if (!session || !authorized) return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12">
      <a href="/" className="font-script text-3xl text-primary">Samara Criar Art's</a>
      <h1 className="mt-5 font-display text-4xl">Acesso administrativo</h1>
      <p className="mt-2 text-muted-foreground">Entre com seu e-mail autorizado para gerenciar os convites da loja.</p>
      <form onSubmit={sendLoginLink} className="mt-7 space-y-4 rounded-2xl border bg-card p-6">
        <label className="block text-sm font-medium">E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border bg-background px-3 py-3" />
        <button className="w-full rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground">Enviar link de acesso</button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
      <a href="/" className="mt-5 text-sm text-primary">Voltar para a loja</a>
    </main>
  );

  return (
    <main className="min-h-screen bg-secondary/40 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="font-script text-2xl text-primary">Samara Criar Art's</p><h1 className="font-display text-4xl">Painel administrativo</h1><p className="text-sm text-muted-foreground">{session.user.email}</p></div>
          <button onClick={() => supabase?.auth.signOut()} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm"><LogOut size={16}/> Sair</button>
        </header>
        {message && <p role="status" className="mt-5 rounded-lg border bg-card p-3 text-sm">{message}</p>}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <form onSubmit={saveInvite} className="space-y-4 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl">{draft.id ? "Editar convite" : "Novo convite"}</h2><button type="button" onClick={() => setDraft(emptyDraft())} aria-label="Limpar formulário"><X size={18}/></button></div>
            <label className="block text-sm">Nome<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label>
            <label className="block text-sm">Identificador (slug)<input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="gerado automaticamente" className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label>
            <label className="block text-sm">Categoria<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as Draft["category"]})} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"><option>Infantil</option><option>Casamento</option><option>15 Anos</option></select></label>
            <label className="block text-sm">Descrição<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} rows={3} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label>
            <label className="block text-sm">Preço (R$)<input required type="number" min="0" step="0.01" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})} className="mt-1 w-full rounded-lg border bg-background px-3 py-2"/></label>
            <label className="block text-sm">Imagem do convite<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>e.target.files?.[0] && void uploadFile(e.target.files[0],"image")} className="mt-1 block w-full text-sm"/></label>
            <label className="block text-sm">Vídeo (opcional)<input type="file" accept="video/mp4,video/webm" onChange={e=>e.target.files?.[0] && void uploadFile(e.target.files[0],"video")} className="mt-1 block w-full text-sm"/></label>
            {draft.image_url && <img src={draft.image_url} alt="Prévia do convite" className="max-h-48 rounded-lg object-contain"/>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft({...draft,is_active:e.target.checked})}/> Exibir na loja</label>
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground disabled:opacity-50"><Save size={16}/>{saving ? "Salvando..." : "Salvar convite"}</button>
          </form>
          <section className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between"><h2 className="font-display text-2xl">Convites cadastrados</h2><span className="text-sm text-muted-foreground">{rows.length} modelos</span></div>
            <div className="mt-4 space-y-3">
              {rows.map(row=><article key={row.id} className="flex gap-3 rounded-xl border p-3">
                {row.image_url ? <img src={row.image_url} alt="" className="h-20 w-14 rounded-md object-cover"/> : <div className="h-20 w-14 rounded-md bg-secondary"/>}
                <div className="min-w-0 flex-1"><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.category} · R$ {Number(row.price).toFixed(2).replace(".",",")} · {row.is_active ? "Ativo" : "Oculto"}</p><div className="mt-2 flex gap-3"><button type="button" onClick={()=>setDraft({...row,price:String(row.price),image_url:row.image_url??"",video_url:row.video_url??""})} className="text-sm text-primary">Editar</button><button type="button" onClick={()=>void removeInvite(row.id)} className="inline-flex items-center gap-1 text-sm text-destructive"><Trash2 size={14}/> Excluir</button></div></div>
              </article>)}
              {rows.length===0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum convite cadastrado no banco ainda.</p>}
            </div>
          </section>
        </div>
        <p className="mt-8 text-xs text-muted-foreground"><Upload className="mr-1 inline h-3 w-3"/> Arquivos enviados ficam no armazenamento privado de gravação, com leitura pública para exibição na loja.</p>
      </div>
    </main>
  );
}
