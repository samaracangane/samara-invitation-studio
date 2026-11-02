import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Samara Criar Art's" },
      { name: "description", content: "Conheça o ateliê Samara Criar Art's de convites personalizados." },
      { property: "og:title", content: "Sobre — Samara Criar Art's" },
      { property: "og:description", content: "Ateliê de convites personalizados." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-script text-4xl text-primary">Nossa história</p>
        <h1 className="font-display text-5xl">Arte que convida</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          A Samara Criar Art's nasceu do amor por papelaria e design. Criamos convites digitais, animados e impressos para casamentos, aniversários de 15 anos, festas infantis e eventos especiais — cada um pensado para contar a história da sua celebração.
        </p>
        <p className="mt-4 text-lg text-muted-foreground">
          No nosso site você personaliza o convite na hora e, se preferir, fala direto com a gente pelo WhatsApp para criar algo exclusivo.
        </p>
      </div>
    </SiteLayout>
  ),
});
