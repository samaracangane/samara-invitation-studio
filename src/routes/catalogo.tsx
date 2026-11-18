import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCard } from "@/components/InviteCard";
import { CATEGORIES, mapSupabaseInvite, type Invite } from "@/data/invites";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo de Convites — Samara’s Enchanted Invite" },
      { name: "description", content: "Encontre seu convite ideal: modelos infantis, casamento e 15 anos, em imagem e vídeo." },
      { property: "og:title", content: "Catálogo de Convites — Convites Digitais" },
      { property: "og:description", content: "Explore nosso catálogo de convites personalizáveis." },
    ],
  }),
  component: Catalogo,
});

const CATEGORY_ART: Record<string, string> = {
  "Mickey": "🐭", "Minnie": "🎀", "Bluey": "🐶", "Alice": "🐇",
  "Dos Rosa": "💗", "Guerreiras K-Pop": "🎤", "Desenhos Animados": "🎨",
  "Princesas": "👑", "Super Herói": "🦸", "Fundo do Mar": "🧜‍♀️",
  "Dinossauro": "🦕", "Toy Story": "🚀", "Barbie": "💖", "Hello Kitty": "🎀",
  "Fazendinha": "🐮", "Circo": "🎪", "Safari": "🦁",
  "Jardim Encantado": "🦋", "365 Sorrisos": "🌈", "Patrulha Canina": "🐾",
};

function Catalogo() {
  const [cat, setCat] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const [catalogInvites, setCatalogInvites] = useState<Invite[]>([]);

  useEffect(() => {
    let alive = true;
    async function loadInvites() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("invites")
        .select("slug,name,category,description,price,image_url,video_url,fields")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (!alive) return;
      if (error || !data) { setCatalogInvites([]); return; }
      setCatalogInvites(data.map((row) => mapSupabaseInvite(row)));
    }
    void loadInvites();
    return () => { alive = false; };
  }, []);

  const list = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return catalogInvites.filter((invite) => {
      const matchesCategory = cat === "Todos" || (cat === "Animados" ? Boolean(invite.video) : invite.category === cat);
      const matchesSearch = !normalizedSearch || invite.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) || invite.description.toLocaleLowerCase("pt-BR").includes(normalizedSearch) || invite.category.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [catalogInvites, cat, search]);

  return (
    <SiteLayout>
      <section className="catalog-hero border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-primary"><Sparkles className="h-4 w-4" /> Nossa coleção</span>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight md:text-6xl">Convites para <span className="text-primary">celebrar.</span></h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">Explore os modelos, escolha seu favorito e deixe os detalhes da sua festa ainda mais especiais.</p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl bg-[#fffafd] px-5 py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="font-display text-3xl font-semibold">Categorias encantadoras</h2><p className="mt-1 text-sm text-muted-foreground">Escolha o tema da sua comemoração.</p></div>
          <span className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-primary">{list.length} {list.length === 1 ? "modelo" : "modelos"}</span>
        </div>
        <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-muted/70 px-4 py-3"><Search className="h-5 w-5 shrink-0 text-primary" aria-hidden="true"/><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por tema, nome ou ocasião..." aria-label="Buscar convites" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpar busca" className="text-muted-foreground hover:text-primary"><X className="h-4 w-4"/></button>}</div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><SlidersHorizontal className="h-4 w-4 text-primary"/> Categorias</div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {CATEGORIES.map((category) => <button key={category} type="button" onClick={() => setCat(category)} aria-pressed={cat === category} className={`group flex min-h-[158px] min-w-0 flex-col items-center justify-center gap-3 rounded-[28px] border bg-white px-3 py-5 text-center shadow-[0_8px_24px_-18px_rgba(60,35,70,.25)] transition-all hover:-translate-y-1 hover:shadow-md ${cat === category ? "border-primary ring-2 ring-primary/20" : "border-[#f0eaf0]"}`}>
            <span className={`flex h-[82px] w-[82px] items-center justify-center rounded-full text-4xl shadow-inner ${cat === category ? "bg-primary/10" : "bg-[#fff0f7]"}`}>{CATEGORY_ART[category]}</span>
            <span className={`text-base font-medium leading-tight text-[#665866] ${cat === category ? "text-primary" : ""}`}>{category}</span>
          </button>)}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Todos", "Animados"].map((category) => <button key={category} type="button" onClick={() => setCat(category)} aria-pressed={cat === category} className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${cat === category ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-secondary/60"}`}>{category}</button>)}
        </div>
        {list.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{list.map((invite) => <InviteCard key={invite.id} invite={invite}/>)}</div> : <div className="mt-10 rounded-3xl border border-dashed border-primary/30 bg-card px-6 py-16 text-center"><Search className="mx-auto h-9 w-9 text-primary/60" aria-hidden="true"/><h2 className="mt-4 font-display text-2xl font-semibold">Nenhum convite encontrado</h2><p className="mt-2 text-sm text-muted-foreground">Tente outro termo ou escolha uma categoria diferente.</p><button type="button" onClick={() => { setSearch(""); setCat("Todos"); }} className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Ver todos os convites</button></div>}
      </div>
    </SiteLayout>
  );
}
