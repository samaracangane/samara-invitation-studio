import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "lucide-react";
import {
  needsAnswer,
  readChoice,
  saveChoices,
  type Purpose,
} from "@/lib/consent";

const PURPOSES: { id: Purpose; label: string; description: string }[] = [
  {
    id: "analytics",
    label: "Análise, fornecida pela Lovable",
    description: "Mede visitas, cliques e outras ações para entendermos como a loja é usada.",
  },
  {
    id: "advertising",
    label: "Publicidade, fornecida pela Meta",
    description: "Usa cookies para medir e melhorar nossos anúncios no Facebook e Instagram.",
  },
];

function gpcActive(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true
  );
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [switches, setSwitches] = useState<Record<Purpose, boolean>>({ analytics: false, advertising: false });
  const panelRef = useRef<HTMLDivElement>(null);
  const gpc = gpcActive();

  useEffect(() => {
    void needsAnswer(["analytics", "advertising"]).then((needed) => {
      if (needed) setOpen(true);
    });
    const openSettings = () => {
      setSwitches({
        analytics: readChoice("analytics") === "granted",
        advertising: readChoice("advertising") === "granted",
      });
      setShowSettings(true);
      setOpen(true);
    };
    window.addEventListener("open-cookie-settings", openSettings);
    return () => window.removeEventListener("open-cookie-settings", openSettings);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open, showSettings]);

  if (!open) return null;

  const acceptAll = () => {
    saveChoices({ analytics: "granted", advertising: "granted" });
    setOpen(false);
  };
  const rejectAll = () => {
    saveChoices({ analytics: "denied", advertising: "denied" });
    setOpen(false);
  };
  const saveSettings = () => {
    saveChoices({
      analytics: switches.analytics ? "granted" : "denied",
      advertising: switches.advertising ? "granted" : "denied",
    });
    setOpen(false);
  };

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-3xl border border-[#f2dce9] bg-white p-5 shadow-2xl outline-none sm:p-6"
    >
      {!showSettings ? (
        <div>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ffe1ed] text-primary">
              <Cookie className="h-5 w-5" />
            </span>
            <div className="text-sm leading-6 text-[#60475f]">
              <p className="font-bold text-foreground">Cookies e privacidade</p>
              <p className="mt-1">
                Contamos visitas sem cookies. Se você aceitar, também medimos cliques e outras ações, e usamos
                cookies de publicidade para medir e melhorar nossos anúncios. Veja a{" "}
                <Link to="/privacidade" className="font-semibold text-primary underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Aceitar tudo
            </button>
            <button
              type="button"
              onClick={rejectAll}
              className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition hover:bg-secondary"
            >
              Recusar tudo
            </button>
            <button
              type="button"
              onClick={() => {
                setSwitches({
                  analytics: readChoice("analytics") === "granted",
                  advertising: readChoice("advertising") === "granted",
                });
                setShowSettings(true);
              }}
              className="rounded-full px-4 py-3 text-sm font-semibold text-primary underline-offset-2 hover:underline"
            >
              Configurações de cookies
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold text-foreground">Configurações de cookies</p>
            <button
              type="button"
              aria-label="Fechar configurações de cookies"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {gpc && (
            <p className="mt-3 rounded-xl bg-secondary px-4 py-3 text-xs leading-5 text-[#60475f]">
              O sinal de privacidade do seu navegador (Global Privacy Control) está ativo e vale como recusa, por
              isso as opções abaixo ficam desligadas.
            </p>
          )}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-bold text-foreground">Necessários</p>
                <p className="text-xs text-muted-foreground">Essenciais para a loja funcionar. Sempre ativos.</p>
              </div>
              <span className="text-xs font-bold text-primary">Sempre ativo</span>
            </div>
            {PURPOSES.map((purpose) => (
              <label
                key={purpose.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{purpose.label}</p>
                  <p className="text-xs text-muted-foreground">{purpose.description}</p>
                </div>
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={purpose.label}
                  checked={!gpc && switches[purpose.id]}
                  disabled={gpc}
                  onChange={(event) =>
                    setSwitches((current) => ({ ...current, [purpose.id]: event.target.checked }))
                  }
                  className="h-5 w-9 shrink-0 accent-[#e75a9d]"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={saveSettings}
            className="mt-4 w-full rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            Salvar preferências
          </button>
        </div>
      )}
    </div>
  );
}
