import { createFileRoute, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { InviteCanvas, type InviteCanvasHandle } from "@/components/InviteCanvas";
import { getInvite, waLink } from "@/data/invites";

export const Route = createFileRoute("/convite/$id")({
  loader: ({ params }) => {
    const invite = getInvite(params.id);
    if (!invite) throw notFound();
    return { invite };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.invite.name} — Samara Criar Art's` },
          { name: "description", content: loaderData.invite.description },
          { property: "og:title", content: `${loaderData.invite.name} — Samara Criar Art's` },
          { property: "og:description", content: loaderData.invite.description },
        ]
      : [{ title: "Convite não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  component: Editor,
});

function Editor() {
  const { invite } = Route.useLoaderData();
  const [fields, setFields] = useState(invite.fields);
  const [busy, setBusy] = useState(false);
  const ref = useRef<InviteCanvasHandle>(null);

  const download = (blob: Blob, ext: string) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `convite-${invite.id}.${ext}`;
    a.click();
  };

  const savePng = () => ref.current?.canvas?.toBlob((b) => b && download(b, "png"), "image/png");

  const saveVideo = () => {
    const c = ref.current?.canvas;
    if (!c) return;
    setBusy(true);
    const types = ["video/mp4", "video/webm;codecs=vp9", "video/webm"];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm";
    const rec = new MediaRecorder(c.captureStream(30), { mimeType, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.onstop = () => {
      download(new Blob(chunks, { type: mimeType }), mimeType.includes("mp4") ? "mp4" : "webm");
      setBusy(false);
    };
    rec.start();
    setTimeout(() => rec.stop(), 5000);
  };

  const pedido = `Olá! Quero o convite "${invite.name}" com estes dados:\n` + fields.map((f) => `• ${f.label}: ${f.value}`).join("\n");

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[minmax(0,380px)_1fr]">
        <div className="mx-auto w-full max-w-sm">
          <InviteCanvas ref={ref} image={invite.image} video={invite.video} fields={fields} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{invite.category}{invite.video && " · Animado"}</p>
          <h1 className="font-display text-4xl">{invite.name}</h1>
          <p className="mt-1 text-lg text-primary">{invite.price}</p>
          <p className="mt-3 text-muted-foreground">{invite.description}</p>

          <div className="mt-8 space-y-4 rounded-lg border bg-card p-5">
            <h2 className="font-display text-2xl">Personalize seu convite</h2>
            {fields.map((f, idx) => (
              <label key={f.key} className="block">
                <span className="text-sm font-medium">{f.label}</span>
                <input
                  value={f.value}
                  onChange={(e) => setFields((all) => all.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            ))}
            <p className="text-xs text-muted-foreground">As fontes, cores e posições do modelo são mantidas automaticamente.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={savePng} className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground">Baixar imagem</button>
            {invite.video && (
              <button onClick={saveVideo} disabled={busy} className="rounded-full border border-primary px-5 py-2.5 text-primary disabled:opacity-50">
                {busy ? "Gerando vídeo (5s)…" : "Baixar vídeo"}
              </button>
            )}
            <a href={waLink(pedido)} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-5 py-2.5 text-accent-foreground">Pedir pelo WhatsApp</a>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
