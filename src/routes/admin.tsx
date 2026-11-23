import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BadgeCheck, BarChart3, Check, ChevronRight, CirclePlus, ClipboardList,
  Crown, FileImage, FolderOpen, Gem, LayoutDashboard, LogOut, Menu,
  Package, Pencil, Plus, Save, Search, Settings, ShieldCheck, Sparkles,
  Trash2, Upload, Users, X, CreditCard, Eye,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type InviteRow = {
  id: string; slug: string; name: string;
  category: "Mickey" | "Minnie" | "Bluey" | "Alice" | "Dos Rosa" | "Guerreiras K-Pop" | "Desenhos Animados" | "Princesas" | "Super Herói" | "Fundo do Mar" | "Dinossauro" | "Toy Story" | "Barbie" | "Hello Kitty" | "Fazendinha" | "Circo" | "Safari" | "Jardim Encantado" | "365 Sorrisos" | "Patrulha Canina";
  description: string; price: number; image_url: string | null; image_urls?: string[];
  video_url: string | null; is_active: boolean; is_featured: boolean; is_new: boolean;
};
type Draft = {
  id?: string; slug: string; name: string;
  category: "Mickey" | "Minnie" | "Bluey" | "Alice" | "Dos Rosa" | "Guerreiras K-Pop" | "Desenhos Animados" | "Princesas" | "Super Herói" | "Fundo do Mar" | "Dinossauro" | "Toy Story" | "Barbie" | "Hello Kitty" | "Fazendinha" | "Circo" | "Safari" | "Jardim Encantado" | "365 Sorrisos" | "Patrulha Canina";
  description: string; price: string; image_url: string; image_urls: string[];
  video_url: string; is_active: boolean; is_featured: boolean; is_new: boolean;
};
const CATEGORY_OPTIONS = ["Mickey","Minnie","Bluey","Alice","Dos Rosa","Guerreiras K-Pop","Desenhos Animados","Princesas","Super Herói","Fundo do Mar","Dinossauro","Toy Story","Barbie","Hello Kitty","Fazendinha","Circo","Safari","Jardim Encantado","365 Sorrisos","Patrulha Canina"] as const;
const emptyDraft = (): Draft => ({
  slug: "", name: "", category: "Mickey", description: "",
  price: "25", image_url: "", image_urls: [], video_url: "", is_active: true, is_featured: false, is_new: false,
});
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel administrativo — Samara Criar Art's Convites" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState("samaracangane6@gmail.com");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState<InviteRow[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryPhoto, setCategoryPhoto] = useState<string>(CATEGORY_OPTIONS[0]);
  const [categoryPhotoUrls, setCategoryPhotoUrls] = useState<Record<string, string>>({});
  const [aiTheme, setAiTheme] = useState("");
  const [aiOccasion, setAiOccasion] = useState("Aniversário");
  const [aiAge, setAiAge] = useState("");
  const [aiColors, setAiColors] = useState("");
  const [aiDetails, setAiDetails] = useState("");
  const [generatingDescription, setGeneratingDescription] = useState(false);

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
        const { data: categoryMedia } = await supabase.from("category_media").select("category,image_url");
        if (categoryMedia) setCategoryPhotoUrls(Object.fromEntries(categoryMedia.map((item) => [item.category, item.image_url])));
        const { data: invites, error: listError } = await supabase.from("invites")
          .select("id,slug,name,category,description,price,image_url,image_urls,video_url,is_active,is_featured,is_new")
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
  const categoryCounts = useMemo(() => CATEGORY_OPTIONS.map((name, index) => ({
    name, count: rows.filter((item) => item.category === name).length,
    color: ["bg-violet-500", "bg-pink-500", "bg-amber-500", "bg-fuchsia-500"][index % 4],
  })), [rows]);
  const filteredRows = useMemo(() => rows.filter((row) =>
    (row.name + " " + row.category).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))
  ), [rows, query]);

  async function signInWithPassword(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Entrando no painel...");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setMessage(error ? "Não foi possível entrar. Confira o e-mail e a senha. Se ainda não cadastrou uma senha, use o link de primeiro acesso." : "");
  }

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

  async function generateDescription() {
    if (!supabase) return;
    if (!aiTheme.trim() || !aiOccasion.trim()) {
      setMessage("Informe o tema e a ocasião para gerar a descrição.");
      return;
    }
    setGeneratingDescription(true);
    setMessage("A IA está criando uma descrição para seu convite...");
    try {
      const { data, error } = await supabase.functions.invoke("generate-invite-description", {
        body: { theme: aiTheme, occasion: aiOccasion, age: aiAge, colors: aiColors, details: aiDetails },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (typeof data?.description !== "string" || !data.description.trim()) {
        throw new Error("A IA não retornou uma descrição. Tente novamente.");
      }
      setDraft((current) => ({ ...current, description: data.description.trim() }));
      setMessage("Descrição criada! Revise o texto e salve o convite.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar a descrição.");
    } finally {
      setGeneratingDescription(false);
    }
  }

  async function uploadFile(file: File, kind: "image" | "video") {
    if (!supabase || !session?.user) return;
    if (kind === "video" && !file.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|3gp)$/i.test(file.name)) {
      setMessage("Selecione um arquivo de vídeo (MP4, MOV ou WebM).");
      return;
    }
    setMessage(kind === "video" ? "Enviando vídeo..." : "Enviando imagem...");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const path = `${session.user.id}/${Date.now()}-${safeName}`;
    try {
      const { error } = await supabase.storage.from("invite-media").upload(path, file, { upsert: true });
      if (error) { setMessage(`Não foi possível enviar o arquivo: ${error.message}`); return; }
      const { data } = supabase.storage.from("invite-media").getPublicUrl(path);
      if (kind === "image") {
        setDraft((current) => ({ ...current, image_url: current.image_url || data.publicUrl, image_urls: [...(current.image_urls || []), data.publicUrl] }));
        setMessage("Imagem adicionada. Você pode enviar outras fotos.");
      } else {
        setDraft((current) => ({ ...current, video_url: data.publicUrl }));
        setMessage("Vídeo enviado com sucesso. Agora salve o convite.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado ao enviar o arquivo.");
    }
  }

  async function uploadCategoryPhoto(file: File) {
    if (!supabase || !session?.user) return;
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
    const path = `${session.user.id}/categorias/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("invite-media").upload(path, file, { upsert: true });
    if (uploadError) { setMessage(uploadError.message); return; }
    const { data } = supabase.storage.from("invite-media").getPublicUrl(path);
    const { error } = await supabase.from("category_media").upsert({ category: categoryPhoto, image_url: data.publicUrl, updated_at: new Date().toISOString() });
    if (error) { setMessage(error.message); return; }
    setCategoryPhotoUrls((current) => ({ ...current, [categoryPhoto]: data.publicUrl }));
    setMessage(`Foto da categoria ${categoryPhoto} salva com sucesso.`);
  }

  async function saveInvite(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setSaving(true); setMessage("");
    const payload = {
      slug: draft.slug.trim() || draft.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: draft.name.trim(), category: draft.category, description: draft.description.trim(),
      price: Number(draft.price), image_url: draft.image_urls[0] || draft.image_url || null, image_urls: draft.image_urls, video_url: draft.video_url || null,
      is_active: draft.is_active, is_featured: draft.is_featured, is_new: draft.is_new,
    };
    const result = draft.id
      ? await supabase.from("invites").update(payload).eq("id", draft.id)
      : await supabase.from("invites").insert(payload);
    setSaving(false);
    if (result.error) { setMessage(result.error.message); return; }
    setDraft((current) => ({ ...current, slug: payload.slug }));
    setMessage("Convite salvo com sucesso. Use o botão \"Ver na loja\" para conferir como ficou.");
    const { data } = await supabase.from("invites")
      .select("id,slug,name,category,description,price,image_url,image_urls,video_url,is_active,is_featured,is_new")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as InviteRow[]);
  }


  async function updateInviteFlag(id: string, field: "is_featured" | "is_new", checked: boolean) {
    if (!supabase) return;
    const { error } = await supabase.from("invites").update({ [field]: checked }).eq("id", id);
    if (error) { setMessage(error.message); return; }
    setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: checked } : row));
    setMessage("Preferência do convite atualizada.");
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
        <p className="mt-3 text-sm leading-6 text-slate-500">Entre com seu e-mail e senha para acessar o painel sem precisar abrir o e-mail a cada entrada.</p>
        <form onSubmit={signInWithPassword} className="mt-7 space-y-4">
          <label className="block text-sm font-medium text-slate-700">E-mail de acesso
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-violet-100 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/>
          </label>
          <label className="block text-sm font-medium text-slate-700">Senha
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-violet-100 bg-white px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"/>
          </label>
          <button className="w-full rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5">Entrar no painel</button>
          <button type="button" onClick={sendLoginLink} className="w-full rounded-xl border border-violet-200 px-5 py-3 text-sm font-medium text-violet-700 transition hover:bg-violet-50">Entrar temporariamente com link por e-mail</button>
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
          <div><p className="font-display text-xl leading-none">Samara Criar Art's</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200">Convites</p></div>
        </div>
        <p className="mb-8 mt-5 px-2 text-xs leading-5 text-violet-200/75">Transforme momentos em lembranças especiais.</p>
        <nav className="space-y-2 text-sm">
          <a href="#inicio" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 font-semibold shadow-lg shadow-violet-950/20"><LayoutDashboard size={18}/> Visão geral</a>
          <a href="#cadastro" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><CirclePlus size={18}/> Cadastrar convite</a>
          <a href="#catalogo" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><FolderOpen size={18}/> Meus convites</a>
          <a href="#categorias" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><BarChart3 size={18}/> Categorias</a>
          <a href="/pagamentos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><CreditCard size={18}/> Pagamentos Wiapy</a>
          <a href="/admin-pedidos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-violet-100 transition hover:bg-white/10"><Package size={18}/> Pedidos e entregas</a>
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
          <section className="mt-5 rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div><h2 className="text-lg font-semibold">Fotos das categorias</h2><p className="mt-1 text-xs text-slate-500">Escolha uma categoria e envie a imagem que aparecerá na página inicial.</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr]">
              <label className="block text-sm font-medium text-slate-700">Categoria
                <select value={categoryPhoto} onChange={e=>setCategoryPhoto(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">{CATEGORY_OPTIONS.map(category=><option key={category}>{category}</option>)}</select>
              </label>
              <label className="block rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-3 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Upload size={17} className="text-violet-600"/> Enviar foto da categoria</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>e.target.files?.[0] && void uploadCategoryPhoto(e.target.files[0])} className="mt-2 block w-full text-xs"/></label>
            </div>
            {categoryPhotoUrls[categoryPhoto] && <img src={categoryPhotoUrls[categoryPhoto]} alt={categoryPhoto} className="mt-4 h-28 w-28 rounded-2xl border object-cover"/>}
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

        {draft.id && <button type="button" aria-label="Fechar edição" onClick={() => setDraft(emptyDraft())} className="fixed inset-0 z-40 cursor-default bg-slate-950/55" />}
        <section id="cadastro" className="mt-6 grid scroll-mt-6 gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={saveInvite} className={`${draft.id ? "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(94vw,680px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto shadow-2xl" : ""} rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6`}>
            <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-500">Gerenciar catálogo</p><h2 className="mt-1 text-xl font-semibold">{draft.id ? "Editar convite" : "Novo convite"}</h2></div><div className="flex items-center gap-2"><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><ClipboardList size={21}/></span>{draft.id && <button type="button" onClick={() => setDraft(emptyDraft())} className="rounded-xl border border-slate-200 p-3 text-slate-500 hover:bg-slate-50" aria-label="Fechar edição"><X size={18}/></button>}</div></div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Nome do convite<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="Ex.: Jardim Encantado" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"/></label>
              <label className="block text-sm font-medium text-slate-700">Identificador (slug)<input value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="Gerado automaticamente" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"/></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">Categoria<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value as Draft["category"]})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">{CATEGORY_OPTIONS.map((category) => <option key={category}>{category}</option>)}</select></label>
                <label className="block text-sm font-medium text-slate-700">Preço (R$)<input required type="number" min="0" step="0.01" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3"/></label>
              </div>
              <label className="block text-sm font-medium text-slate-700">Descrição<textarea value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} rows={3} placeholder="Conte um pouco sobre este modelo..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 outline-none focus:border-violet-400"/></label>
              <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 p-4">
                <div className="flex items-center gap-2"><Sparkles size={18} className="text-violet-600"/><p className="text-sm font-semibold text-violet-900">Criar descrição com IA</p></div>
                <p className="mt-1 text-xs leading-5 text-violet-700">Informe os detalhes do convite. A IA cria um texto comercial para você revisar antes de salvar.</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-medium text-slate-700">Tema / personagem
                    <input value={aiTheme} onChange={e=>setAiTheme(e.target.value)} placeholder="Ex.: Jardim Encantado" maxLength={120} className="mt-1 w-full rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm"/>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">Ocasião
                    <input value={aiOccasion} onChange={e=>setAiOccasion(e.target.value)} placeholder="Ex.: aniversário infantil" maxLength={80} className="mt-1 w-full rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm"/>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">Idade (opcional)
                    <input value={aiAge} onChange={e=>setAiAge(e.target.value)} placeholder="Ex.: 5 anos" maxLength={40} className="mt-1 w-full rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm"/>
                  </label>
                  <label className="block text-xs font-medium text-slate-700">Cores principais (opcional)
                    <input value={aiColors} onChange={e=>setAiColors(e.target.value)} placeholder="Ex.: rosa, lilás e dourado" maxLength={120} className="mt-1 w-full rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm"/>
                  </label>
                </div>
                <label className="mt-3 block text-xs font-medium text-slate-700">Detalhes confirmados do convite (opcional)
                  <textarea value={aiDetails} onChange={e=>setAiDetails(e.target.value)} rows={2} maxLength={500} placeholder="Ex.: convite digital animado; informar somente o que realmente está incluído." className="mt-1 w-full rounded-lg border border-violet-100 bg-white px-3 py-2.5 text-sm"/>
                </label>
                <button type="button" disabled={generatingDescription} onClick={()=>void generateDescription()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-wait disabled:opacity-60">
                  <Sparkles size={16}/>{generatingDescription ? "Criando descrição..." : "Gerar descrição com IA"}
                </button>
              </div>
              <label className="block rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><FileImage size={17} className="text-violet-600"/> Fotos do convite (pode selecionar várias)</span><input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{const files=Array.from(e.target.files || []); files.forEach(file=>void uploadFile(file,"image")); e.currentTarget.value="";}} className="mt-2 block w-full text-xs"/></label>
              <label className="block rounded-xl border border-dashed border-pink-200 bg-pink-50/50 p-4 text-sm font-medium text-slate-700"><span className="flex items-center gap-2"><Upload size={17} className="text-pink-600"/> Vídeo (opcional)</span><input type="file" accept="video/*,.mp4,.mov,.webm,.m4v,.3gp" onChange={e=>{const file=e.currentTarget.files?.[0]; e.currentTarget.value=""; if(file) void uploadFile(file,"video");}} className="mt-2 block w-full text-xs"/></label>
              {draft.image_urls.length > 0 && <div className="grid grid-cols-3 gap-2">{draft.image_urls.map((url,index)=><div key={url} className="relative"><img src={url} alt={`Prévia ${index+1} do convite`} className="h-28 w-full rounded-xl border object-cover"/><button type="button" onClick={()=>setDraft(current=>({...current,image_urls:current.image_urls.filter(item=>item!==url),image_url:current.image_urls.filter(item=>item!==url)[0] || ""}))} className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-xs text-rose-600 shadow">Remover</button></div>)}</div>}
              {draft.video_url && <p className="text-xs text-emerald-700">Vídeo anexado com sucesso.</p>}
              <label className="flex items-center gap-3 rounded-xl bg-violet-50 p-3 text-sm"><input type="checkbox" checked={draft.is_featured} onChange={e=>setDraft({...draft,is_featured:e.target.checked})} className="h-4 w-4 accent-violet-600"/> Mostrar na seção de destaques</label><label className="flex items-center gap-3 rounded-xl bg-pink-50 p-3 text-sm"><input type="checkbox" checked={draft.is_new} onChange={e=>setDraft({...draft,is_new:e.target.checked})} className="h-4 w-4 accent-pink-600"/> Mostrar na seção de lançamentos</label><label className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm"><input type="checkbox" checked={draft.is_active} onChange={e=>setDraft({...draft,is_active:e.target.checked})} className="h-4 w-4 accent-violet-600"/> Exibir este convite na loja</label>
              <div className="flex flex-wrap gap-2"><button disabled={saving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-200 disabled:opacity-50"><Save size={17}/>{saving ? "Salvando..." : "Salvar convite"}</button>{draft.slug && <Link to="/convite/$id" params={{ id: draft.slug }} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"><Eye size={16}/> Ver na loja</Link>}<button type="button" onClick={()=>setDraft(emptyDraft())} className="rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50">Limpar</button></div>
            </div>
          </form>

          <section id="catalogo" className="scroll-mt-6 rounded-2xl border border-violet-100/80 bg-white p-5 shadow-[0_8px_30px_-22px_rgba(61,37,91,.25)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-500">Seus modelos</p><h2 className="mt-1 text-xl font-semibold">Meus convites <span className="ml-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700">{rows.length}</span></h2></div><div className="relative w-full sm:w-52"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar convite..." className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-400"/></div></div>
            <div className="mt-5 space-y-3">
              {filteredRows.map(row=><article key={row.id} className="flex gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-violet-200 hover:bg-violet-50/30">
                {row.image_url ? <img src={row.image_url} alt={row.name} className="h-24 w-20 shrink-0 rounded-xl bg-slate-100 object-cover"/> : <div className="flex h-24 w-20 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-300"><FileImage size={25}/></div>}
                <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{row.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${row.is_active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{row.is_active?"Ativo":"Oculto"}</span></div><p className="mt-1 text-xs text-slate-500">{row.category} · {money(Number(row.price))}</p><div className="mt-2 flex flex-wrap gap-3 text-xs"><label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={Boolean(row.is_featured)} onChange={e=>void updateInviteFlag(row.id,"is_featured",e.target.checked)} className="accent-violet-600"/> Destaque</label><label className="inline-flex items-center gap-1.5"><input type="checkbox" checked={Boolean(row.is_new)} onChange={e=>void updateInviteFlag(row.id,"is_new",e.target.checked)} className="accent-pink-600"/> Lançamento</label></div><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={()=>setDraft({...row,price:String(row.price),image_url:row.image_url??"",image_urls:row.image_urls?.length ? row.image_urls : (row.image_url ? [row.image_url] : []),video_url:row.video_url??"",is_featured:Boolean(row.is_featured),is_new:Boolean(row.is_new)})} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-fuchsia-600"><Pencil size={13}/> Editar</button><button type="button" onClick={()=>void removeInvite(row.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600"><Trash2 size={13}/> Excluir</button><Link to="/convite/$id" params={{ id: row.slug }} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-600"><Eye size={13}/> Ver na loja</Link></div></div>
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
