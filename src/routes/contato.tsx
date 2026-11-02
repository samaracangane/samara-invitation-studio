import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { INSTAGRAM, waLink } from "@/data/invites";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Samara Criar Art's" },
      { name: "description", content: "Peça seu orçamento de convite pelo WhatsApp." },
      { property: "og:title", content: "Contato — Samara Criar Art's" },
      { property: "og:description", content: "Peça seu orçamento pelo WhatsApp." },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [nome, setNome] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-5xl">Contato</h1>
        <p className="mt-3 text-muted-foreground">Conte sobre a sua festa e enviaremos o orçamento.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            window.open(waLink(`Olá, sou ${nome}. ${msg}`), "_blank");
          }}
        >
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full rounded-md border bg-card px-3 py-2" />
          <textarea required value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} placeholder="Tipo de festa, data, quantidade…" className="w-full rounded-md border bg-card px-3 py-2" />
          <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">Enviar pelo WhatsApp</button>
        </form>
        <p className="mt-8 text-sm">Instagram: <a className="text-primary" href={`https://instagram.com/${INSTAGRAM}`}>@{INSTAGRAM}</a></p>
      </div>
    </SiteLayout>
  );
}
