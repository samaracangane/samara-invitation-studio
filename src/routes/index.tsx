import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Play, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCard } from "@/components/InviteCard";
import { invites } from "@/data/invites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Convites Digitais — Seu momento merece um convite especial" },
      { name: "description", content: "Escolha, personalize e encante. Convites digitais e animados para tornar sua comemoração inesquecível." },
      { property: "og:title", content: "Convites Digitais — Seu momento merece um convite especial" },
      { property: "og:description", content: "Convites digitais e animados para celebrar momentos especiais." },
    ],
  }),
  component: Home,
});

function Home() {
  const animated = invites.find((i) => i.video);
  const featured = invites.slice(0, 4);
  return (
    <SiteLayout>
      <section className="store-hero relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[.18em] text-primary shadow-sm">
              <Sparkles className="h-4 w-4" /> Celebre com encanto
            </span>
            <p className="mt-7 font-script text-4xl text-primary md:text-5xl">Momentos especiais merecem</p>
            <h1 className="mt-1 font-display text-5xl font-semibold leading-[.98] tracking-tight text-foreground md:text-7xl">
              um convite <span className="text-primary">inesquecível.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
              Encontre o modelo perfeito para sua comemoração. Personalize com os dados da sua festa e surpreenda seus convidados com um convite cheio de carinho.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition hover:-translate-y-0.5 hover:shadow-xl">
                Escolher meu convite <ArrowRight className="h-4 w-4" />
              </Link>
              {animated && <Link to="/convite/$id" params={{ id: animated.id }} className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-7 py-3.5 text-sm font-semibold text-primary transition hover:bg-white">
                <Play className="h-4 w-4" /> Ver convite animado
              </Link>}
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/75">
              <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Feito para sua ocasião</span>
              <span className="inline-flex items-center gap-2"><WandSparkles className="h-4 w-4 text-primary" /> Personalização fácil</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/40 blur-xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/65 p-3 shadow-[var(--shadow-elegant)] backdrop-blur">
              {animated ? (
                <video src={animated.video} poster={animated.image} autoPlay muted loop playsInline className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
              ) : (
                <img src={featured[0]?.image} alt="Modelo de convite em destaque" className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" />
              )}
              <div className="absolute -bottom-5 -left-5 rounded-2xl border border-white bg-white px-4 py-3 shadow-lg">
                <p className="font-display text-xl font-semibold text-primary">Seu convite,</p>
                <p className="text-xs text-muted-foreground">do seu jeitinho especial ✨</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-5 py-7 sm:grid-cols-3">
        {[
          [<Sparkles className="h-5 w-5" />, "Modelos especiais", "Para diferentes temas e ocasiões"],
          [<WandSparkles className="h-5 w-5" />, "Personalize online", "Coloque os dados da sua comemoração"],
          [<ShieldCheck className="h-5 w-5" />, "Prático e digital", "Tudo pensado para facilitar sua vida"],
        ].map(([icon, title, desc]) => <div key={String(title)} className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">{icon}</span><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-muted-foreground">{desc}</span></span></div>)}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">Escolha com carinho</p><h2 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Encontre seu convite</h2><p className="mt-2 text-sm text-muted-foreground">Um modelo especial para cada momento.</p></div>
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Ver todos os modelos <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">{featured.map((i) => <InviteCard key={i.id} invite={i} />)}</div>
      </section>

      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[var(--color-primary)] text-primary-foreground md:mx-auto md:max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
          <div><p className="font-script text-3xl text-white/80">Vamos comemorar?</p><h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Seu próximo convite começa aqui.</h2><p className="mt-2 max-w-xl text-sm text-white/80">Explore os modelos e encontre aquele que combina com a sua festa.</p></div>
          <Link to="/catalogo" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </SiteLayout>
  );
}