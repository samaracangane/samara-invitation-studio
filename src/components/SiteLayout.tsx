import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { INSTAGRAM, waLink } from "@/data/invites";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none" aria-label="Convites Digitais - página inicial">
      <span className="font-display text-2xl font-semibold tracking-tight text-primary">Convites</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-foreground">DIGITAIS</span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Início" },
  { to: "/catalogo", label: "Convites" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav aria-label="Navegação principal" className="hidden items-center gap-4 text-sm sm:flex sm:gap-6">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="transition-colors hover:text-primary" activeProps={{ className: "text-primary font-medium" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-md border sm:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" aria-label="Navegação móvel" className="border-t bg-background px-4 py-3 sm:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1">
              {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm transition-colors hover:bg-secondary hover:text-primary" activeProps={{ className: "bg-secondary text-primary font-medium" }} activeOptions={{ exact: true }}>{n.label}</Link>)}
            </div>
          </nav>
        )}
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
          <Logo />
          <p className="text-sm text-muted-foreground">Convites personalizados, digitais e animados, feitos com carinho.</p>
          <div className="flex flex-col gap-1 text-sm">
            <a href={waLink("Olá! Vim pelo site.")} target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp</a>
            <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="hover:text-primary">@{INSTAGRAM}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}