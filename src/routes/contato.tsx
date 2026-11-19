import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { INSTAGRAM } from "@/data/invites";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Samara Criar Art's Convites" },
      { name: "description", content: "Acompanhe a Samara Criar Art's Convites no Instagram." },
      { property: "og:title", content: "Contato — Samara Criar Art's Convites" },
      { property: "og:description", content: "Acompanhe novidades e inspirações para sua comemoração." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary"><Instagram className="h-8 w-8" /></div>
        <h1 className="mt-6 font-display text-5xl font-semibold">Vamos nos conectar?</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Acompanhe nosso Instagram para ver novidades, inspirações e lançamentos de convites digitais.</p>
        <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5">
          <Instagram className="h-5 w-5" /> Acompanhar no Instagram
        </a>
        <div className="mt-12"><Link to="/catalogo" className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">Explorar catálogo <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </SiteLayout>
  );
}