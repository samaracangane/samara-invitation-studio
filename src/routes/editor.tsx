import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft, ArrowDown, ArrowUp, Download, Eye, EyeOff, Lock, Plus,
  Redo2, RotateCcw, Sparkles, Trash2, Unlock, Undo2,
} from "lucide-react";
import { invites } from "@/data/invites";

type Layer = {
  id: string;
  name: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  visible: boolean;
  locked: boolean;
};

const initialLayers: Layer[] = [
  { id: "headline", name: "Título", text: "VOCÊ ESTÁ CONVIDADO!", x: 50, y: 24, size: 5, color: "#ffffff", font: "Cinzel", visible: true, locked: false },
  { id: "name", name: "Nome", text: "Mariana", x: 50, y: 43, size: 12, color: "#fff1c9", font: "Great Vibes", visible: true, locked: false },
  { id: "age", name: "Idade", text: "11 anos", x: 50, y: 53, size: 6, color: "#ffffff", font: "Fredoka", visible: true, locked: false },
  { id: "date", name: "Data e horário", text: "04 de julho • 14h30", x: 50, y: 78, size: 4, color: "#ffffff", font: "Fredoka", visible: true, locked: false },
  { id: "place", name: "Local", text: "Endereço da comemoração", x: 50, y: 85, size: 3.4, color: "#ffffff", font: "Jost", visible: true, locked: false },
];

export const Route = createFileRoute("/editor")({
  head: () => ({ meta: [
    { title: "Editor Mágico — Samara’s Enchanted Invite" },
    { name: "description", content: "Personalize seu convite com camadas, textos e ferramentas criativas." },
  ] }),
  component: MagicEditor,
});

function MagicEditor() {
  const background = invites.find((item) => item.id === "15-anos-coroa")?.image ?? invites[0]?.image ?? "";
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selected, setSelected] = useState("name");
  const [history, setHistory] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = layers.find((layer) => layer.id === selected);
  const selectedIndex = layers.findIndex((layer) => layer.id === selected);

  const updateLayers = (next: Layer[]) => {
    setHistory((items) => [...items.slice(-29), layers]);
    setFuture([]);
    setLayers(next);
  };
  const updateActive = (patch: Partial<Layer>) => {
    if (!active || active.locked) return;
    updateLayers(layers.map((layer) => layer.id === active.id ? { ...layer, ...patch } : layer));
  };
  const addText = () => {
    const id = `text-${Date.now()}`;
    updateLayers([...layers, { id, name: "Novo texto", text: "Seu texto aqui", x: 50, y: 65, size: 5, color: "#ffffff", font: "Fredoka", visible: true, locked: false }]);
    setSelected(id);
  };
  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    setFuture((items) => [layers, ...items]);
    setLayers(previous);
    setHistory((items) => items.slice(0, -1));
  };
  const redo = () => {
    const next = future[0];
    if (!next) return;
    setHistory((items) => [...items, layers]);
    setLayers(next);
    setFuture((items) => items.slice(1));
  };
  const moveLayer = (direction: -1 | 1) => {
    if (selectedIndex < 0) return;
    const target = selectedIndex + direction;
    if (target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[selectedIndex], next[target]] = [next[target], next[selectedIndex]];
    updateLayers(next);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current) return;
    const bounds = stageRef.current.getBoundingClientRect();
    const x = Math.max(3, Math.min(97, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(3, Math.min(97, ((event.clientY - bounds.top) / bounds.height) * 100));
    setLayers((items) => items.map((layer) => layer.id === dragging ? { ...layer, x, y } : layer));
  };
  const onPointerUp = () => {
    if (dragging) {
      setHistory((items) => [...items.slice(-29), layers]);
      setFuture([]);
      setDragging(null);
    }
  };
  const svgMarkup = useMemo(() => {
    const textNodes = layers.filter((layer) => layer.visible).map((layer) =>
      `<text x="${layer.x}%" y="${layer.y}%" text-anchor="middle" dominant-baseline="middle" font-family="${layer.font}, Arial, sans-serif" font-size="${layer.size}%" font-weight="600" fill="${layer.color}" paint-order="stroke" stroke="#000000" stroke-opacity=".22" stroke-width=".5">${escapeXml(layer.text)}</text>`
    ).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 100 125"><image href="${background}" x="0" y="0" width="100" height="125" preserveAspectRatio="xMidYMid slice"/>${textNodes}</svg>`;
  }, [background, layers]);

  const downloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "meu-convite-samara.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const downloadPng = async () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, 1080, 1350);
      canvas.toBlob((png) => {
        if (!png) return;
        const pngUrl = URL.createObjectURL(png);
        const anchor = document.createElement("a");
        anchor.href = pngUrl;
        anchor.download = "meu-convite-samara.png";
        anchor.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    image.onerror = () => { URL.revokeObjectURL(url); window.alert("Não foi possível exportar a imagem de fundo. Tente baixar em SVG."); };
    image.src = url;
  };

  return (
    <main className="min-h-screen bg-[#f7f4fa] text-[#302342]">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-full p-2 text-violet-700 hover:bg-violet-50" aria-label="Voltar à loja"><ArrowLeft size={19}/></Link>
          <div><p className="font-display text-lg font-semibold">Samara’s Enchanted Invite</p><p className="text-[11px] text-violet-500">Editor Mágico · demonstração</p></div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={undo} disabled={!history.length} className="rounded-full border px-3 py-2 text-xs disabled:opacity-40" title="Desfazer"><Undo2 size={16}/></button>
          <button onClick={redo} disabled={!future.length} className="rounded-full border px-3 py-2 text-xs disabled:opacity-40" title="Refazer"><Redo2 size={16}/></button>
          <button onClick={downloadPng} className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-800"><Download size={15}/> Baixar PNG</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[260px_minmax(300px,1fr)_290px]">
        <aside className="order-2 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm lg:order-1">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Camadas</h2><button onClick={addText} className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700"><Plus size={14}/> Texto</button></div>
          <p className="mb-3 mt-1 text-xs text-slate-500">Selecione uma camada para editar ou arraste o texto no convite.</p>
          <div className="space-y-2">
            {[...layers].reverse().map((layer) => (
              <div key={layer.id} className={`flex items-center gap-2 rounded-xl border p-2 ${selected === layer.id ? "border-violet-400 bg-violet-50" : "border-slate-100"}`}>
                <button onClick={() => setSelected(layer.id)} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-medium">{layer.name}</span><span className="block truncate text-[11px] text-slate-500">{layer.text}</span></button>
                <button onClick={() => updateLayers(layers.map((item) => item.id === layer.id ? { ...item, visible: !item.visible } : item))} title={layer.visible ? "Ocultar" : "Mostrar"} className="p-1 text-slate-500">{layer.visible ? <Eye size={15}/> : <EyeOff size={15}/>}</button>
                <button onClick={() => updateLayers(layers.map((item) => item.id === layer.id ? { ...item, locked: !item.locked } : item))} title={layer.locked ? "Desbloquear" : "Bloquear"} className="p-1 text-slate-500">{layer.locked ? <Lock size={15}/> : <Unlock size={15}/>}</button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2 border-t pt-4">
            <button onClick={() => moveLayer(-1)} disabled={selectedIndex <= 0} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-xs disabled:opacity-40"><ArrowDown size={14}/> Enviar</button>
            <button onClick={() => moveLayer(1)} disabled={selectedIndex < 0 || selectedIndex >= layers.length - 1} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-xs disabled:opacity-40"><ArrowUp size={14}/> Trazer</button>
          </div>
          <button onClick={() => { if (!active) return; updateLayers(layers.filter((layer) => layer.id !== active.id)); setSelected(layers.find((layer) => layer.id !== active.id)?.id ?? ""); }} disabled={!active} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-40"><Trash2 size={14}/> Excluir camada selecionada</button>
        </aside>

        <section className="order-1 flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-violet-100 bg-[#ece7f2] p-3 shadow-inner sm:p-6 lg:order-2">
          <div className="mb-3 flex w-full max-w-[430px] items-center justify-between text-xs text-slate-500"><span>Pré-visualização do convite</span><span className="inline-flex items-center gap-1"><Sparkles size={13}/> Arraste os textos</span></div>
          <div ref={stageRef} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} className="relative aspect-[4/5] w-full max-w-[430px] touch-none overflow-hidden rounded-xl bg-white shadow-2xl" style={{ backgroundImage: `url("${background}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
            {layers.filter((layer) => layer.visible).map((layer) => (
              <button key={layer.id} type="button" onPointerDown={(event) => { setSelected(layer.id); if (!layer.locked) { setDragging(layer.id); event.currentTarget.setPointerCapture(event.pointerId); } }} onClick={() => setSelected(layer.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded px-1 outline-none ${selected === layer.id ? "ring-2 ring-violet-400 ring-offset-2" : "hover:ring-1 hover:ring-white"} `} style={{ left: `${layer.x}%`, top: `${layer.y}%`, color: layer.color, fontFamily: layer.font, fontSize: `clamp(10px, ${layer.size}cqw, 38px)`, fontWeight: 600, containerType: "inline-size", textShadow: "0 1px 5px #0008" }}>{layer.text}</button>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">Modelo demonstrativo. O catálogo e a liberação após pagamento serão conectados nas próximas etapas.</p>
        </section>

        <aside className="order-3 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <h2 className="font-semibold">Personalizar</h2>
          {active ? active.locked ? <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Esta camada está bloqueada. Desbloqueie para editar.</p> : (
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-medium">Nome da camada<input value={active.name} onChange={(e) => updateActive({ name: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
              <label className="block text-xs font-medium">Texto<input value={active.text} maxLength={100} onChange={(e) => updateActive({ text: e.target.value })} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"/></label>
              <label className="block text-xs font-medium">Fonte<select value={active.font} onChange={(e) => updateActive({ font: e.target.value })} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm"><option>Fredoka</option><option>Great Vibes</option><option>Cinzel</option><option>Jost</option><option>Cormorant Garamond</option><option>Arial</option></select></label>
              <label className="block text-xs font-medium">Tamanho <span className="float-right">{active.size.toFixed(1)}</span><input type="range" min="2" max="16" step=".2" value={active.size} onChange={(e) => updateActive({ size: Number(e.target.value) })} className="mt-2 w-full accent-violet-700"/></label>
              <label className="flex items-center justify-between text-xs font-medium">Cor do texto<input type="color" value={active.color} onChange={(e) => updateActive({ color: e.target.value })} className="h-9 w-14 cursor-pointer rounded border p-1"/></label>
              <div className="grid grid-cols-2 gap-2"><label className="text-xs font-medium">Posição X<input type="number" min="0" max="100" value={Math.round(active.x)} onChange={(e) => updateActive({ x: Math.max(0, Math.min(100, Number(e.target.value))) })} className="mt-1 w-full rounded-lg border px-2 py-2"/></label><label className="text-xs font-medium">Posição Y<input type="number" min="0" max="100" value={Math.round(active.y)} onChange={(e) => updateActive({ y: Math.max(0, Math.min(100, Number(e.target.value))) })} className="mt-1 w-full rounded-lg border px-2 py-2"/></label></div>
            </div>
          ) : <p className="mt-3 text-sm text-slate-500">Escolha uma camada para começar.</p>}
          <div className="mt-6 border-t pt-4"><button onClick={() => { setLayers(initialLayers); setSelected("name"); setHistory([]); setFuture([]); }} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw size={14}/> Restaurar modelo</button><button onClick={downloadSvg} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet-50 py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"><Download size={14}/> Baixar arquivo SVG</button></div>
        </aside>
      </div>
    </main>
  );
}

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character] ?? character);
}
