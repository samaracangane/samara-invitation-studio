import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InviteCard } from "@/components/InviteCard";
import { mapSupabaseInvite, type Invite } from "@/data/invites";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Heart, ShieldCheck, Sparkles, WandSparkles, Star, PartyPopper, Search } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CATEGORIES } from "@/data/invites";
import blueyInvite from "@/assets/convite-bluey-helena.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samara Criar Art's Convites — Convites digitais para momentos inesquecíveis" },
      { name: "description", content: "Encontre o convite digital perfeito para sua comemoração na Samara Criar Art's Convites." },
      { property: "og:title", content: "Samara Criar Art's Convites — Seu momento merece um convite especial" },
      { property: "og:description", content: "Convites digitais e animados para celebrar momentos especiais." },
    ],
  }),
  component: Home,
});

function Home() {
  const [featuredInvites, setFeaturedInvites] = useState<Invite[]>([]);
  const [launchInvites, setLaunchInvites] = useState<Invite[]>([]);
  const [homeSearch, setHomeSearch] = useState("");
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) return;
      const inviteFields = "slug,name,category,description,price,image_url,image_urls,video_url,fields";
      const [featuredResult, launchResult, categoryResult] = await Promise.all([
        supabase.from("invites").select(inviteFields).eq("is_active", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(8),
        supabase.from("invites").select(inviteFields).eq("is_active", true).eq("is_new", true).order("created_at", { ascending: false }).limit(8),
        supabase.from("category_media").select("category,image_url"),
      ]);
      if (!alive) return;
      if (featuredResult.data) setFeaturedInvites(featuredResult.data.map((row) => mapSupabaseInvite(row)));
      if (launchResult.data) setLaunchInvites(launchResult.data.map((row) => mapSupabaseInvite(row)));
      if (categoryResult.data) setCategoryImages(Object.fromEntries(categoryResult.data.map((row) => [row.category, row.image_url])));
    }
    void load();
    return () => { alive = false; };
  }, []);
  return (
    <SiteLayout>
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#ff397d] via-[#a52be2] to-[#ff8a28] text-white">
        <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#ffe36e]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-[#ffb5d2]/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-5%] top-[-15%] h-[420px] w-[420px] rounded-full border-[48px] border-white/10" />
        <div className="relative mx-auto grid min-h-[490px] max-w-7xl items-center gap-8 px-6 py-14 md:grid-cols-[1.05fr_.95fr] md:px-10 md:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#ffe36e]" /> Sua festa começa aqui
            </span>
            <p className="mt-7 font-script text-4xl text-[#ffe6a6] md:text-5xl">Celebre cada detalhe!</p>
            <h1 className="mt-2 max-w-2xl font-display text-5xl font-extrabold leading-[.98] tracking-tight text-white md:text-7xl">
              O convite perfeito para um momento <span className="text-[#ffe36e]">inesquecível.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/90 md:text-lg">
              Encante seus convidados antes mesmo da festa começar. Escolha seu tema e tenha um convite digital feito para celebrar!
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-[#ffe36e] px-7 py-4 text-sm font-extrabold text-[#54205e] shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
                ESCOLHA SEU CONVITE <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 py-4 text-sm font-semibold text-white"><Heart className="h-4 w-4 text-[#ffe36e]" /> Feito para sua comemoração</span>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-white/85"><Star className="h-4 w-4 fill-[#ffe36e] text-[#ffe36e]" /><Star className="h-4 w-4 fill-[#ffe36e] text-[#ffe36e]" /><Star className="h-4 w-4 fill-[#ffe36e] text-[#ffe36e]" /><Star className="h-4 w-4 fill-[#ffe36e] text-[#ffe36e]" /><Star className="h-4 w-4 fill-[#ffe36e] text-[#ffe36e]" /> Um toque especial em cada detalhe</div>
          </div>
          <div className="relative mx-auto flex w-full max-w-[470px] items-center justify-center py-5">
            <div className="absolute right-3 top-3 flex h-16 w-16 rotate-12 items-center justify-center rounded-2xl bg-[#ffe36e] text-[#71317b] shadow-xl"><PartyPopper className="h-8 w-8" /></div>
            <div className="absolute bottom-5 left-0 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full bg-[#58d9d0] text-[#54205e] shadow-xl"><Sparkles className="h-7 w-7" /></div>
            <div className="relative w-[78%] rotate-[-5deg] rounded-[2rem] border-[8px] border-white/90 bg-white p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[1.35rem] bg-white">
                <img src={blueyInvite.url} alt="Convite Bluey da Helena, 5 anos — 23/05 às 16h30 no Salão de Festas Doce Infância" fetchPriority="high" decoding="async" className="block h-auto w-full" />
              </div>
            </div>
            <div className="absolute -left-[7%] top-10 w-[31%] -rotate-[8deg] rounded-2xl border-4 border-white bg-gradient-to-br from-[#fff1a8] to-[#ff8bb8] p-3 text-center text-[#69315e] shadow-2xl">
              <Heart className="mx-auto h-7 w-7 fill-[#e84b8a] text-[#e84b8a]" />
              <p className="mt-2 font-display text-xl font-bold">Feito com carinho</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider">Para celebrar!</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-3 w-full bg-gradient-to-r from-[#ffe36e] via-[#ffb1d1] to-[#5de0d4]" />
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10"><form onSubmit={(event) => { event.preventDefault(); window.location.href = "/catalogo?busca=" + encodeURIComponent(homeSearch.trim()); }} className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-[#efd9e8] bg-white p-2 pl-5 shadow-md"><Search className="h-5 w-5 shrink-0 text-primary"/><input value={homeSearch} onChange={(event) => setHomeSearch(event.target.value)} placeholder="Pesquise por convite, tema ou personagem..." aria-label="Pesquisar convites" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"/><button type="submit" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Buscar</button></form></section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7 text-center"><p className="font-script text-3xl text-primary">Encontre seu tema favorito</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">Categorias encantadoras</h2><p className="mt-2 text-sm text-muted-foreground">Um convite especial para cada tipo de comemoração.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.map((category, index) => <Link key={category} to="/catalogo" search={{ categoria: category }} className="group flex min-h-[156px] flex-col items-center justify-center gap-3 rounded-3xl border border-[#f2dce9] bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#e75a9d] hover:shadow-lg">
            <span className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl text-4xl shadow-sm transition group-hover:scale-105 ${["bg-[#ffe1ed]","bg-[#e2f7ff]","bg-[#fff0ce]","bg-[#eee3ff]"][index % 4]}`}>{categoryImages[category] ? <img src={categoryImages[category]} alt={category} loading="lazy" decoding="async" width={80} height={80} className="h-full w-full object-cover"/> : ({"Mickey":"🐭","Minnie":"🎀","Bluey":"🐶","Alice":"🐇","Dos Rosa":"💗","Guerreiras K-Pop":"🎤","Desenhos Animados":"🎨","Princesas":"👑","Super Herói":"🦸","Fundo do Mar":"🧜‍♀️","Dinossauro":"🦕","Toy Story":"🚀","Barbie":"💖","Hello Kitty":"🎀","Fazendinha":"🐮","Circo":"🎪","Safari":"🦁","Jardim Encantado":"🦋","365 Sorrisos":"🌈","Patrulha Canina":"🐾"})[category]}</span>
            <span className="text-sm font-bold text-[#60475f]">{category}</span>
          </Link>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12"><div className="mb-7"><p className="font-script text-3xl text-primary">Novidades chegando</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">Lançamentos</h2></div>{launchInvites.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{launchInvites.map((invite) => <InviteCard key={invite.id} invite={invite}/>)}</div> : <p className="rounded-2xl border border-dashed border-primary/30 bg-white p-5 text-center text-sm text-muted-foreground">Novos lançamentos aparecerão aqui em breve.</p>}</section>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="font-script text-3xl text-primary">Escolha seu favorito</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">Convites em destaque</h2><p className="mt-2 text-sm text-muted-foreground">Veja os modelos disponíveis e escolha o que combina com sua festa.</p></div><Link to="/catalogo" className="text-sm font-bold text-primary hover:underline">Ver todos os convites →</Link></div>
        {featuredInvites.length > 0 ? <div className="mb-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{featuredInvites.map((invite) => <InviteCard key={invite.id} invite={invite}/>)}</div> : <div className="mb-12 rounded-2xl border border-dashed border-primary/30 bg-white p-6 text-center text-sm text-muted-foreground">Novos convites estarão disponíveis aqui em breve.</div> }

      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7 text-center"><p className="font-script text-3xl text-primary">Quem já comemorou com a gente</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">Depoimentos de clientes</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Juliana M.", event: "Aniversário de 5 anos", text: "O convite ficou perfeito! Recebi rapidinho e todos os convidados elogiaram as cores." },
            { name: "Patrícia S.", event: "Chá de bebê", text: "Atendimento carinhoso e um resultado lindo. Já escolhi o próximo para o aniversário dela." },
            { name: "Renata L.", event: "Festa de 15 anos", text: "Super fácil de comprar e o convite chegou exatamente como eu imaginava. Recomendo muito!" },
          ].map((d) => <figure key={d.name} className="rounded-3xl border border-[#f2dce9] bg-white p-6 shadow-sm">
            <div className="text-lg text-[#ffb400]" aria-label="5 estrelas">★★★★★</div>
            <blockquote className="mt-3 text-sm leading-6 text-[#60475f]">“{d.text}”</blockquote>
            <figcaption className="mt-4"><span className="block font-bold text-foreground">{d.name}</span><span className="text-xs text-muted-foreground">{d.event}</span></figcaption>
          </figure>)}
        </div>
      </section>

      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#ff397d] via-[#a52be2] to-[#ff8a28] text-white shadow-xl md:mx-auto md:max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
          <div><p className="font-script text-3xl text-[#ffe6a6]">Vamos comemorar?</p><h2 className="mt-1 font-display text-3xl font-bold md:text-4xl">Seu próximo convite começa aqui.</h2><p className="mt-2 max-w-xl text-sm text-white/90">Explore os modelos e encontre aquele que combina com a sua festa.</p></div>
          <Link to="/catalogo" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ffe36e] px-6 py-3 font-bold text-[#54205e] transition hover:-translate-y-0.5">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </SiteLayout>
  );
}