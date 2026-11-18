import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShieldCheck, Sparkles, WandSparkles, Star, PartyPopper } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CATEGORIES } from "@/data/invites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samara Invitation Studio — Convites digitais para momentos inesquecíveis" },
      { name: "description", content: "Encontre o convite digital perfeito para sua comemoração na Samara Invitation Studio." },
      { property: "og:title", content: "Samara Invitation Studio — Seu momento merece um convite especial" },
      { property: "og:description", content: "Convites digitais e animados para celebrar momentos especiais." },
    ],
  }),
  component: Home,
});

function Home() {
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
              <div className="overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#ffb4d2] via-[#ffe7a2] to-[#b7f3e9] px-5 py-12 text-center text-[#66315f]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/75"><Sparkles className="h-7 w-7 text-[#d92d83]" /></div>
                <p className="mt-5 font-script text-3xl">Você está convidado!</p>
                <p className="mt-2 font-display text-4xl font-bold leading-tight">VAMOS<br/>COMEMORAR?</p>
                <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#e85b9c]" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[.22em]">Um dia especial merece</p>
                <p className="mt-1 text-lg font-extrabold">um convite especial!</p>
              </div>
            </div>
            <div className="absolute bottom-9 right-0 w-[31%] rotate-[8deg] rounded-2xl border-4 border-white bg-gradient-to-br from-[#fff1a8] to-[#ff8bb8] p-3 text-center text-[#69315e] shadow-2xl">
              <Heart className="mx-auto h-7 w-7 fill-[#e84b8a] text-[#e84b8a]" />
              <p className="mt-2 font-display text-xl font-bold">Feito com carinho</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider">Para celebrar!</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-3 w-full bg-gradient-to-r from-[#ffe36e] via-[#ffb1d1] to-[#5de0d4]" />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="mb-7 text-center"><p className="font-script text-3xl text-primary">Encontre seu tema favorito</p><h2 className="mt-1 font-display text-3xl font-bold text-foreground md:text-4xl">Categorias encantadoras</h2><p className="mt-2 text-sm text-muted-foreground">Um convite especial para cada tipo de comemoração.</p></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {CATEGORIES.map((category, index) => <Link key={category} to="/catalogo" className="group flex min-h-[122px] flex-col items-center justify-center gap-2 rounded-3xl border border-[#f2dce9] bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-[#e75a9d] hover:shadow-lg">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl transition group-hover:scale-110 ${["bg-[#ffe1ed]","bg-[#e2f7ff]","bg-[#fff0ce]","bg-[#eee3ff]"][index % 4]}`}>{({"Mickey":"🐭","Minnie":"🎀","Bluey":"🐶","Alice":"🐇","Dos Rosa":"💗","Guerreiras K-Pop":"🎤","Desenhos Animados":"🎨","Princesas":"👑","Super Herói":"🦸","Fundo do Mar":"🧜‍♀️","Dinossauro":"🦕","Toy Story":"🚀","Barbie":"💖","Hello Kitty":"🎀","Fazendinha":"🐮","Circo":"🎪","Safari":"🦁","Jardim Encantado":"🦋","365 Sorrisos":"🌈","Patrulha Canina":"🐾"})[category]}</span>
            <span className="text-sm font-bold text-[#60475f]">{category}</span>
          </Link>)}
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