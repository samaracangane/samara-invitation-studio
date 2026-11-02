import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCard } from "@/components/InviteCard";
import { invites } from "@/data/invites";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samara Criar Art's — Convites personalizados" },
      { name: "description", content: "Convites digitais, animados e impressos. Personalize o seu online e baixe na hora." },
      { property: "og:title", content: "Samara Criar Art's — Convites personalizados" },
      { property: "og:description", content: "Convites digitais, animados e impressos. Personalize online." },
    ],
  }),
  component: Home,
});

function Home() {
  const animated = invites.find((i) => i.video)!;
  return (
    <SiteLayout>
      <section style={{ background: "var(--gradient-hero)" }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="font-script text-4xl text-primary">Cada festa merece</p>
            <h1 className="font-display text-5xl leading-tight md:text-6xl">um convite feito com arte</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Escolha um modelo, digite os dados da sua festa e veja o convite pronto na hora — com as fontes e cores do modelo. Também em vídeo animado.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalogo" className="rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[var(--shadow-elegant)]">Ver convites</Link>
              <Link to="/convite/$id" params={{ id: animated.id }} className="rounded-full border border-primary px-6 py-3 text-primary">Testar o editor</Link>
            </div>
          </div>
          <div className="mx-auto w-64 md:w-80">
            <video src={animated.video} poster={animated.image} autoPlay muted loop playsInline className="w-full rounded-2xl shadow-[var(--shadow-elegant)]" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3">
        {[
          ["1. Escolha", "Navegue pelos modelos de casamento, 15 anos e infantil."],
          ["2. Personalize", "Digite nome, data e local. O texto muda na tela na hora."],
          ["3. Receba", "Baixe a imagem ou o vídeo, ou peça o impresso pelo WhatsApp."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-lg border bg-card p-6">
            <h3 className="font-display text-2xl text-primary">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl">Modelos em destaque</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {invites.slice(0, 4).map((i) => <InviteCard key={i.id} invite={i} />)}
        </div>
      </section>
    </SiteLayout>
  );
}
