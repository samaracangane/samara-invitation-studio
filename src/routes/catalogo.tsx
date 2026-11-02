import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCard } from "@/components/InviteCard";
import { CATEGORIES, invites } from "@/data/invites";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Convites — Samara Criar Art's" },
      { name: "description", content: "Catálogo de convites de casamento, 15 anos e infantis, em imagem e vídeo." },
      { property: "og:title", content: "Convites — Samara Criar Art's" },
      { property: "og:description", content: "Catálogo de convites personalizáveis." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const [cat, setCat] = useState<string>("Todos");
  const list = cat === "Todos" ? invites : cat === "Animados" ? invites.filter((i) => i.video) : invites.filter((i) => i.category === cat);
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-5xl">Convites</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {["Todos", ...CATEGORIES, "Animados"].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-sm ${cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {list.map((i) => <InviteCard key={i.id} invite={i} />)}
        </div>
      </div>
    </SiteLayout>
  );
}
