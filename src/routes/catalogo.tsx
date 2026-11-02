import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCard } from "@/components/InviteCard";
import { CATEGORIES, invites } from "@/data/invites";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Convites — Convites Digitais" },
      { name: "description", content: "Encontre seu convite ideal: modelos infantis, casamento e 15 anos, em imagem e vídeo." },
      { property: "og:title", content: "Convites — Convites Digitais" },
      { property: "og:description", content: "Explore nosso catálogo de convites personalizáveis." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const [cat, setCat] = useState<string>("Todos");
  const [search, setSearch] = useState("");
  const list = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return invites.filter((invite) => {
      const matchesCategory = cat === "Todos" || (cat === "Animados" ? Boolean(invite.video) : invite.category === cat);
      const matchesSearch = !normalizedSearch || invite.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) || invite.description.toLocaleLowerCase("pt-BR").includes(normalizedSearch) || invite.category.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
  }, [cat, search]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Encontre o seu modelo</p><h1 className="mt-2 font-display text-5xl">Nosso catálogo</h1><p className="mt-2 text-muted-foreground">Convites especiais para momentos inesquecíveis.</p></div><span className="text-sm text-muted-foreground">{list.length} {list.length === 1 ? "modelo encontrado" : "modelos encontrados"}</span></div>
        <div className="mt-8 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm"><Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true"/><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por tema, nome ou ocasião..." aria-label="Buscar convites" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>{search && <button type="button" onClick={() => setSearch("")} className="text-xs font-medium text-primary hover:underline">Limpar</button>}</div>
        <div className="mt-6 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true"/><span className="text-sm font-medium">Filtrar por:</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{["Todos", ...CATEGORIES, "Animados"].map((category) => <button key={category} type="button" onClick={() => setCat(category)} aria-pressed={cat === category} className={`rounded-full border px-4 py-2 text-sm transition-colors ${cat === category ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary hover:text-primary"}`}>{category}</button>)}</div>
        {list.length > 0 ? <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">{list.map((invite) => <InviteCard key={invite.id} invite={invite}/>)}</div> : <div className="mt-10 rounded-xl border border-dashed bg-card px-6 py-14 text-center"><Search className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true"/><h2 className="mt-4 font-display text-2xl">Nenhum convite encontrado</h2><p className="mt-2 text-sm text-muted-foreground">Tente outro termo ou escolha uma categoria diferente.</p><button type="button" onClick={() => { setSearch(""); setCat("Todos"); }} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Ver todos os convites</button></div>}
      </div>
    </SiteLayout>
  );
}