import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck, BarChart3, Check, ChevronRight, CirclePlus, ClipboardList,
  Crown, FileImage, FolderOpen, Gem, LayoutDashboard, LogOut, Menu,
  Package, Pencil, Plus, Save, Search, Settings, ShieldCheck, Sparkles,
  Trash2, Upload, Users, X,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type InviteRow = {
  id: string; slug: string; name: string;
  category: "Infantil" | "Casamento" | "15 Anos";
  description: string; price: number; image_url: string | null;
  video_url: string | null; is_active: boolean;
};
type Draft = {
  id?: string; slug: string; name: string;
  category: "Infantil" | "Casamento" | "15 Anos";
  description: string; price: string; image_url: string;
  video_url: string; is_active: boolean;
};
const emptyDraft = (): Draft => ({
  slug: "", name: "", category: "Infantil", description: "",
  price: "25", image_url: "", video_url: "", is_active: true,
});
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo — Convites Digitais" }] }),
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
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
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
        setMessage("Este e-mail ainda não foi liberado como administrador. Verifique a configuração no Supabase.");
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

  const activeCount = useMemo(() => rows.filter((item) => item.is_active).length, [rows]);
  const categoryCounts = useMemo(() => [
    { name: "Infantil", count: rows.filter((item) => item.category === "Infantil").length, color: "bg-violet-500" },
    { name: "Casamento", count: rows.filter((item) => item.category === "Casamento").length, color: "bg-pink-500" },
    { name: "15 Anos", count: rows.filter((item) => item.category === "15 Anos").length, color: "bg-amber-500" },
  ], [rows]);
  const filteredRows = useMemo(() => rows.filter((row) =>
    (row.name + " " + row.category).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))
  ), [rows, query]);

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
    setMessage(kind === "image" ? "Imagem enviada com sucesso." : "Vídeo enviado com sucesso.");
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
    if (!supabase || !window.confirm("Deseja realmente excluir este convite?")) return;
    const { error } = await supabase.from("invites").delete().eq("id", id);
    if (error) setMessage(error.message);
    else { setRows((current) => current.filter((row) => row.id !== id)); setMessage("Convite excluído."); }
  }

  if (!isSupabaseConfigured) return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <h1 className="font-display text-4xl">Área administrativa</h1>
      <p className="mt-4 text-muted-foreground">A conexão com o Supabase precisa ser configurada nas variáveis de ambiente do projeto.</p>
    </main>
  );
  if (checking) return <main className="grid min-h-screen place-items-center bg-[#f8f6fc] text-[#51436b]">Carregando seu painel...</main>;

  if (!session || !authorized) return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f7f0ff] via-[#fff9fc] to-[#fceef5] px-5 py-12">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-pink-200/50 blur-3xl" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_-30px_rgba(83,54,120,.3)] sm:p-10">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg"><Crown size={28}/></div>
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-violet-500">Painel de gestão</p>
        <h1 className="mt-2 font-display text-4xl text-[#302342]">Acesso administrativo</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Entre com seu e-mail autorizado para gerenciar seu catálogo de convites.</p>
        <form onSubmit={sendLoginLink} className="mt-7 space-y-4">
          <label className="block text-sm font-medium text-slate-700">E-mail de acesso
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-violet-100 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/>
          </label>
          <button className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">Enviar link de acesso</button>
          {message && <p role="status" className="rounded-xl bg-violet-50 p-3 text-sm text-violet-700">{message}</p>}
        </form>
        <a href="/" className="mt-7 inline-flex text-sm font-medium text-violet-700 hover:text-fuchsia-600">← Voltar para a loja</a>
      </div>
    </main>
  );

  return (
    <div className="min-h-screen bg-[#f8f6fc] text-[#302342] lg:flex">
      <aside className={`${menuOpen ? "block" : "hidden"} fixed inset-y-0 left-0 z-40 w-[270px] flex-col bg-gradient-to-b from-[#281b3d] via-[#302044] to-[#21182f] px-5 py-7 text-white shadow-2xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0`}>
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-amber-300"><Crown size={29}/></div>
          <div><p className="font-display text-2xl leading-none">Convites</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.28em] text-violet-200">Digitais</p></div>
        </div>
        <p className="mb-8 mt-5 px-2 text-xs leading-5 text-violet-200/75">Transforme momentos em lembranças especiais.</p>
        <nav className="space-y-2 text-sm">
          <a href="#inicio" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 font-semibold shadow-lg shadow-violet-950/20"><LayoutDashboard size={18}/> Visão geral</a>
          <a href="#cadastro" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><CirclePlus size={18}/> Cadastrar convite</a>
          <a href="#catalogo" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><FolderOpen size={18}/> Meus convites</a>
          <a href="#categorias" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><BarChart3 size={18}/> Categorias</a>
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.07] p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-300"><Sparkles size={16}/><span className="text-xs font-semibold">Sua loja em destaque</span></div>
          <p className="text-xs leading-5 text-violet-100/80">Mantenha seu catálogo atualizado para encantar seus clientes.</p>
          <a href="#cadastro" className="mt-3 flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15">Criar convite <ChevronRight size={15}/></a>
        </div>
        <button onClick={() => supabase?.auth.signOut()} className="mt-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-violet-100 hover:bg-white/10"><LogOut size={18}/> Sair do painel</button>
      </aside>
      {menuOpen && <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-black/40 lg:hidden"/>}

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 sm:py-8 lg:px-9">
        <header id="inicio" className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-violet-100 bg-white p-2.5 lg:hidden" aria-label="Abrir menu"><Menu size={20}/></button>
            <div><p className="text-sm text-violet-500">Bem-vinda de volta 👋</p><h1 className="font-display text-3xl font-semibold sm:text-4xl">Olá, Administradora!</h1><p className="mt-1 text-sm text-slate-500">Aqui está o resumo do seu catálogo.</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500"/> Sistema online</span>
            <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-200 to-pink-200 text-violet-700 sm:flex"><Users size={19}/></div>
          </div>
        </header>

        {message && <div role="status" className="mb-6 flex items-start gap-2 rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-violet-800 shadow-sm"><BadgeCheck size={18} className="mt-0.5 shrink-0"/>{message}</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<FileImage size={23}/>} label="Convites cadastrados" value={String(rows.length)} detail="Modelos no catálogo" tone="violet"/>
          <StatCard icon={<Check size={23}/>} label="Convites ativos" value={String(activeCount)} detail="Visíveis na loja" tone="pink"/>
          <StatCard icon={<Package size={23}/>} label="Convites ocultos" value={String(rows.length-activeCount)} detail="Não exibidos na loja" tone="green"/>
          <StatCard icon={<Gem size={23}/>} label="Categorias" value={String(categoryCounts.filter(c=>c.count>0).length)} detail="Com modelos cadastrados" tone="amber"/>
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <section id="categorias" className="rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Visão do catálogo</h2><p className="mt-1 text-xs text-slate-500">Distribuição dos seus convites por categoria</p></div><BarChart3 className="text-violet-500"/></div>
            <div className="mt-7 space-y-5">
              {categoryCounts.map((cat) => <div key={cat.name}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{cat.name}</span><span className="text-slate-500">{cat.count} {cat.count===1?"modelo":"modelos"}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${cat.color}`} style={{width: rows.length ? `${cat.count/rows.length*100}%` : "0%"}}/></div></div>)}
            </div>
            {rows.length===0 && <p className="mt-5 rounded-xl bg-violet-50 p-3 text-xs text-violet-700">Assim que você cadastrar convites, os dados aparecerão aqui.</p>}
          </section>
          <section className="rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div className="flex items-center gap-2"><Sparkles className="text-amber-500"/><h2 className="text-lg font-semibold">Ações rápidas</h2></div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a href="#cadastro" className="group rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 p-4 text-center transition hover:-translate-y-1"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white"><Plus/></span><span className="mt-3 block text-sm font-semibold">Cadastrar convite</span></a>
              <a href="#catalogo" className="group rounded-2xl bg-gradient-to-br from-pink-50 to-rose-100 p-4 text-center transition hover:-translate-y-1"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500 text-white"><FileImage/></span><span className="mt-3 block text-sm font-semibold">Ver catálogo</span></a>
              <a href="#cadastro" className="group rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 p-4 text-center transition hover:-translate-y-1"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white"><Upload/></span><span className="mt-3 block text-sm font-semibold">Enviar mídia</span></a>
              <a href="/" target="_blank" rel="noreferrer" className="group rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 text-center transition hover:-translate-y-1"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white"><Users/></span><span className="mt-3 block text-sm font-semibold">Ver loja</span></a>
            </div>
          </section>
        </div>

        <section id="cadastro" className="mt-6 grid scroll-mt-6 gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={saveInvite} className="rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-500">Gerenciar catálogo</p><h2 className="mt-1 text-xl font-semibold">{draft.id ? "Editar convite" : "Novo convite"}</h2></div><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><ClipboardList size={21}/></span></div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Nome do convite<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Ex.: Jardim Encantado" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"/></label>
              <label className="block text-sm font-medium text-slate-700">Identificador (slug)<input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="Gerado automaticamente" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"/></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">Categoria<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as Draft["category"]})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3"><option>Infantil</option><option>Casamento</option><option>15 Anos</option></select></label>
                <label className="block text-sm font-medium text-slate-700">Preço (R$)<input required type="number" min="0" step="0.01" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3"/></label>
              </div>
              <label className="block text-sm font-medium text-slate-700">Descrição<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} rows={3} placeholder="Conte um pouco sobre este modelo..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400"/></label>
              <label className="block rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><FileImage size={17} className="text-violet-600"/> Imagem do convite</span><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>e.target.files?.[0] && void uploadFile(e.target.files[0],"image")} className="mt-2 block w-full text-xs"/></label>
              <label className="block rounded-xl border border-dashed border-pink-200 bg-pink-50/50 p-4 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Upload size={17} className="text-pink-600"/> Vídeo (opcional)</span><input type="file" accept="video/mp4,video/webm" onChange={e=>e.target.files?.[0] && void uploadFile(e.target.files[0],"video")} className="mt-2 block w-full text-xs"/></label>
              {draft.image_url && <img src={draft.image_url} alt="Prévia do convite" className="max-h-48 rounded-xl border object-contain"/>}
              {draft.video_url && <p className="text-xs text-emerald-700">Vídeo anexado com sucesso.</p>}
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft({...draft,is_active:e.target.checked})} className="h-4 w-4 accent-violet-600"/> Exibir este convite na loja</label>
              <div className="flex gap-2"><button disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 disabled:opacity-50"><Save size={17}/>{saving ? "Salvando..." : "Salvar convite"}</button><button type="button" onClick={()=>setDraft(emptyDraft())} className="rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Limpar</button></div>
            </div>
          </form>

          <section id="catalogo" className="scroll-mt-6 rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-500">Seus modelos</p><h2 className="mt-1 text-xl font-semibold">Meus convites <span className="ml-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700">{rows.length}</span></h2></div><div className="relative w-full sm:w-52"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar convite..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400"/></div></div>
            <div className="mt-5 space-y-3">
              {filteredRows.map(row=><article key={row.id} className="flex gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50/30">
                {row.image_url ? <img src={row.image_url} alt={row.name} className="h-24 w-20 shrink-0 rounded-xl bg-slate-100 object-cover"/> : <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-300"><FileImage size={25}/></div>}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{row.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.is_active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{row.is_active?"Ativo":"Oculto"}</span></div><p className="mt-1 text-xs text-slate-500">{row.category} · {money(Number(row.price))}</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={()=>setDraft({...row,price:String(row.price),image_url:row.image_url??"",video_url:row.video_url??""})} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-fuchsia-600"><Pencil size={13}/> Editar</button><button type="button" onClick={()=>void removeInvite(row.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600"><Trash2 size={13}/> Excluir</button></div></div>
              </article>)}
              {filteredRows.length===0 && <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center"><FolderOpen className="mx-auto text-slate-300" size={30}/><p className="mt-3 text-sm font-medium text-slate-600">{query?"Nenhum convite encontrado.":"Seu catálogo está começando!"}</p><p className="mt-1 text-xs text-slate-400">{query?"Tente outra busca.":"Cadastre seu primeiro modelo no formulário ao lado."}</p></div>}
            </div>
          </section>
        </section>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-violet-100 pt-5 text-xs text-slate-400"><span>♡ Convites Digitais · Personalize, celebre, compartilhe!</span><span className="inline-flex items-center gap-1"><ShieldCheck size={14}/> Área administrativa protegida</span></footer>
      </main>
    </div>
  );
}

function StatCard({icon,label,value,detail,tone}:{icon:React.ReactNode;label:string;value:string;detail:string;tone:"violet"|"pink"|"green"|"amber"}) {
  const styles = {
    violet:"bg-violet-50 text-violet-700", pink:"bg-pink-50 text-pink-700",
    green:"bg-emerald-50 text-emerald-700", amber:"bg-amber-50 text-amber-700",
  };
  return <div className="rounded-2xl border border-violet-100/70 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)]"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`rounded-xl p-2.5 ${styles[tone]}`}>{icon}</span></div><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></div>;
}
