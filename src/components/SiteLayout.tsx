import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Instagram, MessageCircle, Sparkles } from "lucide-react";
import { INSTAGRAM, waLink } from "@/data/invites";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Convites Digitais - página inicial">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition group-hover:rotate-[-5deg]"><Sparkles className="h-5 w-5"/></span>
      <span className="flex flex-col leading-none"><span className="font-display text-[1.65rem] font-semibold tracking-tight text-foreground">Convites</span><span className="mt-1 text-[9px] font-bold uppercase tracking-[.34em] text-primary">DIGITAIS</span></span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Início" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans">
      <div className="bg-[var(--color-sidebar)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-2 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <Sparkles className="mr-2 h-3.5 w-3.5 text-[var(--color-gold)]"/> Convites digitais feitos para transformar momentos em lembranças
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Logo />
          <nav aria-label="Navegação principal" className="hidden items-center gap-1 text-sm sm:flex">
            {nav.map((n) => <Link key={n.to} to={n.to} className="rounded-full px-4 py-2 font-medium text-foreground/75 transition hover:bg-secondary hover:text-primary" activeProps={{ className: "rounded-full bg-secondary px-4 py-2 font-semibold text-primary" }} activeOptions={{ exact: true }}>{n.label}</Link>)}
          </nav>
          <div className="hidden sm:block"><a href={waLink("Olá! Vim pelo site e gostaria de informações sobre os convites.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><MessageCircle className="h-4 w-4"/> Fale conosco</a></div>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground sm:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && <nav id="mobile-navigation" aria-label="Navegação móvel" className="border-t border-border bg-background px-4 py-3 shadow-lg sm:hidden"><div className="mx-auto flex max-w-6xl flex-col gap-1">{nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-secondary hover:text-primary" activeProps={{ className: "rounded-xl bg-secondary px-4 py-3 font-semibold text-primary" }} activeOptions={{ exact: true }}>{n.label}</Link>)}<a href={waLink("Olá! Vim pelo site.")} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"><MessageCircle className="h-4 w-4"/> Fale conosco</a></div></nav>}
      </header>
      <main>{children}</main>
      <footer className="mt-16 bg-[var(--color-sidebar)] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
          <div><Logo/><p className="mt-4 max-w-xs text-sm leading-6 text-white/65">Convites personalizados, digitais e animados para celebrar os momentos mais especiais da vida.</p></div>
          <div><h3 className="font-display text-xl font-semibold">Navegue</h3><div className="mt-4 flex flex-col gap-3 text-sm text-white/70"><Link to="/" className="hover:text-white">Início</Link><Link to="/catalogo" className="hover:text-white">Catálogo de convites</Link><Link to="/sobre" className="hover:text-white">Sobre nós</Link><Link to="/contato" className="hover:text-white">Contato</Link></div></div>
          <div><h3 className="font-display text-xl font-semibold">Vamos conversar?</h3><p className="mt-3 text-sm text-white/65">Estamos aqui para ajudar você a encontrar o convite ideal.</p><div className="mt-4 flex flex-wrap gap-3"><a href={waLink("Olá! Vim pelo site.")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm hover:bg-white/20"><MessageCircle className="h-4 w-4"/> WhatsApp</a><a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm hover:bg-white/20"><Instagram className="h-4 w-4"/> Instagram</a></div></div>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-white/45">© {new Date().getFullYear()} Convites Digitais. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}