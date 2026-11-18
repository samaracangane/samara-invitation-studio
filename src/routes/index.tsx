import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CATEGORIES } from "@/data/invites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samara’s Enchanted Invite — Seu momento merece um convite especial" },
      { name: "description", content: "Escolha, personalize e encante. Convites digitais e animados para tornar sua comemoração inesquecível na Samara’s Enchanted Invite." },
      { property: "og:title", content: "Samara’s Enchanted Invite — Seu momento merece um convite especial" },
      { property: "og:description", content: "Convites digitais e animados para celebrar momentos especiais na Samara’s Enchanted Invite." },
    ],
  }),
  component: Home,
});

function Home() {

  return (
    <SiteLayout>
      <section className="store-hero relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-80 w-80 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[.9fr_1.1fr] md:py-16">
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

            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/75">
              <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Feito para sua ocasião</span>
              <span className="inline-flex items-center gap-2"><WandSparkles className="h-4 w-4 text-primary" /> Personalização fácil</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="mb-4 text-center md:text-left"><h2 className="font-display text-2xl font-semibold text-foreground">Categorias encantadoras</h2><p className="mt-1 text-sm text-muted-foreground">Escolha seu tema favorito.</p></div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {CATEGORIES.map((category, index) => <Link key={category} to="/catalogo" className="group flex min-h-[126px] flex-col items-center justify-center gap-2 rounded-[24px] border border-[#f0eaf0] bg-white/90 px-2 py-3 text-center shadow-[0_8px_24px_-18px_rgba(60,35,70,.25)] transition hover:-translate-y-1 hover:shadow-md">
                <span className={`flex h-[66px] w-[66px] items-center justify-center rounded-full text-3xl shadow-inner ${["bg-[#ffe8f1]","bg-[#e8f5ff]","bg-[#fff0d9]","bg-[#f1eaff]"][index % 4]}`}>{{"Mickey":"🐭","Minnie":"🎀","Bluey":"🐶","Alice":"🐇","Dos Rosa":"💗","Guerreiras K-Pop":"🎤","Desenhos Animados":"🎨","Princesas":"👑","Super Herói":"🦸","Fundo do Mar":"🧜‍♀️","Dinossauro":"🦕","Toy Story":"🚀","Barbie":"💖","Hello Kitty":"🎀","Fazendinha":"🐮","Circo":"🎪","Safari":"🦁","Jardim Encantado":"🦋","365 Sorrisos":"🌈","Patrulha Canina":"🐾"}[category]}</span>
                <span className="text-xs font-semibold leading-tight text-[#665866]">{category}</span>
              </Link>)}
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

      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[var(--color-primary)] text-primary-foreground md:mx-auto md:max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 px-7 py-10 md:flex-row md:items-center md:px-12 md:py-12">
          <div><p className="font-script text-3xl text-white/80">Vamos comemorar?</p><h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">Seu próximo convite começa aqui.</h2><p className="mt-2 max-w-xl text-sm text-white/80">Explore os modelos e encontre aquele que combina com a sua festa.</p></div>
          <Link to="/catalogo" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-primary transition hover:-translate-y-0.5">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </SiteLayout>
  );
}