import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Convites Digitais" },
      { name: "description", content: "Conheça nossa coleção de convites personalizados." },
      { property: "og:title", content: "Sobre — Convites Digitais" },
      { property: "og:description", content: "Convites personalizados para celebrar momentos especiais." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-script text-4xl text-primary">Nossa inspiração</p>
        <h1 className="font-display text-5xl">Arte que convida</h1>
        <p className="mt-6 text-lg text-muted-foreground">Criamos convites digitais, animados e impressos para casamentos, aniversários de 15 anos, festas infantis e eventos especiais — cada modelo pensado para contar a história da sua celebração.</p>
        <p className="mt-4 text-lg text-muted-foreground">Aqui você pode escolher seu modelo, personalizar os detalhes e, se preferir, falar diretamente com nossa equipe pelo WhatsApp para criar algo exclusivo.</p>
      </div>
    </SiteLayout>
  ),
});