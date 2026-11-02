import { createFileRoute, notFound } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Download, RotateCcw, Sparkles, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
          { title: `${loaderData.invite.name} — Convites Digitais` },
          { name: "description", content: loaderData.invite.description },
          { property: "og:title", content: `${loaderData.invite.name} — Convites Digitais` },
          { property: "og:description", content: loaderData.invite.description },
        ]
      : [{ title: "Convite não encontrado" }, { name: "robots", content: "noindex" }],
  }),
  component: Editor,
});

function Editor() {
  const { invite } = Route.useLoaderData();
  const [fields, setFields] = useState(invite.fields.map((field) => ({ ...field })));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const ref = useRef<InviteCanvasHandle>(null);

  const download = (blob: Blob, ext: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `convite-${invite.id}.${ext}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const savePng = () => {
    const canvas = ref.current?.canvas;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) download(blob, "png");
      else setNotice("Não foi possível gerar a imagem. Tente novamente.");
    }, "image/png");
  };

  // Exportação provisória para pré-visualização: captura cinco segundos do canvas.
  // A exportação final deve preservar a duração e o áudio do arquivo original no servidor.
  const saveVideoPreview = () => {
    const canvas = ref.current?.canvas;
    if (!canvas || typeof MediaRecorder === "undefined") {
      setNotice("Este navegador não oferece suporte à gravação da prévia animada.");
      return;
    }
    setBusy(true);
    setNotice("");
    const candidates = ["video/mp4", "video/webm;codecs=vp9", "video/webm"];
    const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(canvas.captureStream(30), {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });
    } catch {
      setBusy(false);
      setNotice("Não foi possível iniciar a gravação neste navegador.");
      return;
    }
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onerror = () => {
      setBusy(false);
      setNotice("Ocorreu um erro ao gerar a prévia.");
    };
    recorder.onstop = () => {
      download(new Blob(chunks, { type: mimeType }), mimeType.includes("mp4") ? "mp4" : "webm");
      setBusy(false);
      setNotice("Prévia de cinco segundos gerada. A exportação completa do vídeo original será ativada na próxima etapa.");
    };
    recorder.start();
    window.setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, 5000);
  };

  const updateField = (key: string, value: string) => {
    setFields((current) => current.map((field) => field.key === key ? { ...field, value } : field));
  };

  const pedido = `Olá! Quero o convite "${invite.name}" com estes dados:\\n` +
    fields.map((field) => `• ${field.label}: ${field.value}`).join("\\n");

  return (
    <SiteLayout>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <Link to="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>

        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Editor de convite
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{invite.name}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Preencha os campos e acompanhe a personalização na prévia. O estilo configurado para este modelo é preservado.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] lg:gap-10">
          <section className="rounded-3xl border border-border/70 bg-card p-3 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Prévia ao vivo</p>
                <p className="mt-1 text-xs text-muted-foreground">{invite.video ? "Modelo animado" : "Modelo em imagem"}</p>
              </div>
              {invite.video && <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">Vídeo</span>}
            </div>
            <div className="mx-auto max-w-[340px] overflow-hidden rounded-2xl bg-muted">
              <InviteCanvas ref={ref} image={invite.image} video={invite.video} fields={fields} />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">A prévia se atualiza conforme você digita.</p>
          </section>

          <section className="space-y-5">
            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Seus dados</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Altere somente as informações da sua festa.</p>
                </div>
                <button type="button" onClick={() => setFields(invite.fields.map((field) => ({ ...field })))} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition hover:border-primary hover:text-primary">
                  <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                </button>
              </div>

              {fields.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label key={field.key} className="block min-w-0">
                      <span className="mb-1.5 block text-sm font-semibold">{field.label}</span>
                      <input
                        value={field.value}
                        maxLength={120}
                        onChange={(event) => updateField(field.key, event.target.value)}
                        placeholder={`Digite ${field.label.toLocaleLowerCase("pt-BR")}`}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
                  Este modelo ainda não possui campos de personalização configurados. Nossa equipe poderá preparar os campos para este convite.
                </p>
              )}

              <div className="mt-6 rounded-2xl bg-secondary/70 p-4">
                <p className="text-sm font-semibold text-foreground">O visual do modelo é preservado</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Fonte, cor, tamanho e posição são definidos na configuração de cada convite. Modelos que já tenham letras gravadas no arquivo de fundo precisam de tratamento antes de serem liberados para edição.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">Finalizar convite</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{invite.price} · {invite.category}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={savePng} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
                  <Download className="h-4 w-4" /> Baixar imagem
                </button>
                {invite.video && (
                  <button type="button" onClick={saveVideoPreview} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-5 py-3 text-sm font-semibold text-primary transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60">
                    <Video className="h-4 w-4" /> {busy ? "Gerando prévia…" : "Baixar prévia animada"}
                  </button>
                )}
                <a href={waLink(pedido)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
                  Continuar pelo WhatsApp
                </a>
              </div>
              {notice && <p role="status" className="mt-4 rounded-xl bg-secondary p-3 text-xs leading-5 text-secondary-foreground">{notice}</p>}
              {invite.video && <p className="mt-3 text-xs leading-5 text-muted-foreground">A gravação disponível nesta etapa é apenas uma prévia de cinco segundos, sem áudio. A geração do vídeo completo com a duração e o áudio originais requer a etapa de renderização final.</p>}
            </div>
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
