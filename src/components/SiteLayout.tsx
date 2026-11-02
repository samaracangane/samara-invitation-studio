import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { INSTAGRAM, waLink } from "@/data/invites";

export function Logo() {
  return (
    <Link to="/" className="flex flex-col leading-none">
      <span className="font-script text-3xl text-primary">Samara</span>
      <span className="font-display text-xs tracking-[0.35em] text-foreground">CRIAR ART'S</span>
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
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="flex gap-4 text-sm sm:gap-6">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="hover:text-primary" activeProps={{ className: "text-primary font-medium" }} activeOptions={{ exact: true }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
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
