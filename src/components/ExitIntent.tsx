import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";

// Shows once per visit when the visitor is about to leave (mouse to the top on desktop, quick scroll-up / idle on phones).
export function ExitIntent() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("exit-shown")) return;
    const show = () => { if (sessionStorage.getItem("exit-shown")) return; sessionStorage.setItem("exit-shown", "1"); setOpen(true); };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    let lastY = window.scrollY;
    const onScroll = () => { const y = window.scrollY; if (y > 800 && lastY - y > 120) show(); lastY = y; };
    const idle = window.setTimeout(show, 45000);
    document.addEventListener("mouseout", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { document.removeEventListener("mouseout", onLeave); window.removeEventListener("scroll", onScroll); window.clearTimeout(idle); };
  }, []);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Antes de ir" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="relative w-full max-w-md rounded-3xl bg-card p-7 text-center shadow-2xl">
        <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-secondary"><X className="h-5 w-5" /></button>
        <Heart className="mx-auto h-10 w-10 fill-primary text-primary" />
        <h2 className="mt-3 font-display text-2xl font-semibold">Espere! Sua festa merece um convite lindo 💜</h2>
        <p className="mt-2 text-sm text-muted-foreground">Escolha o tema, personalize com os dados da festa e receba o convite digital pronto para mandar no celular.</p>
        <Link to="/catalogo" onClick={() => setOpen(false)} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground">Ver convites agora</Link>
        <button type="button" onClick={() => setOpen(false)} className="mt-3 text-xs text-muted-foreground underline">Continuar navegando</button>
      </div>
    </div>
  );
}
