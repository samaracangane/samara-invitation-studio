import { canTrack, onConsentChange } from "@/lib/consent";

export const META_PIXEL_ID = "1588787409405169";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
  push: Fbq;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let pixelLoaded = false;

function loadPixel() {
  if (pixelLoaded || typeof window === "undefined") return;
  pixelLoaded = true;

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
      else fbq.queue.push(args);
    } as Fbq;
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  window.fbq("init", META_PIXEL_ID, {}, { agent: "lovable" });
  window.fbq("track", "PageView");
}

/** Loads the Meta Pixel only when advertising consent permits it, now or after a later grant. */
export function initMetaPixel() {
  void canTrack("advertising").then((allowed) => {
    if (allowed) loadPixel();
  });
  onConsentChange(() => {
    void canTrack("advertising").then((allowed) => {
      if (allowed) loadPixel();
    });
  });
}
