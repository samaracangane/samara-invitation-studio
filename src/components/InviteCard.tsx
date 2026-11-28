import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Invite } from "@/data/invites";

export function InviteCard({ invite }: { invite: Invite }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !invite.video) return;

    // Load and play only when the card is near the viewport to keep the store fast.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!video.src) {
              const source = video.dataset['src'];
              if (source) {
                video.src = source;
                video.load();
              }
            }
            void video.play().catch(() => {
              // Some browsers may defer autoplay until the next user interaction.
            });
          } else {
            video.pause();
          }
        }
      },
      { rootMargin: "150px", threshold: 0.15 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [invite.video]);

  return (
    <Link to="/convite/$id" params={{ id: invite.id }} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-secondary">
        <img
          src={invite.image}
          alt={invite.name}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          width={768}
          height={1344}
          className={`aspect-[4/7] w-full object-cover transition group-hover:scale-105 ${videoReady ? "opacity-0" : "opacity-100"}`}
        />
        {invite.video && (
          <>
            <video
              ref={videoRef}
              data-src={invite.video}
              muted
              loop
              playsInline
              preload="none"
              poster={invite.image}
              onCanPlay={() => setVideoReady(true)}
              aria-label={`Prévia animada de ${invite.name}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${videoReady ? "opacity-100" : "opacity-0"}`}
            />
            <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Animado</span>
          </>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{invite.category}</p>
      <h3 className="font-display text-xl">{invite.name}</h3>
      <p className="text-sm font-medium text-primary">{invite.price}</p>
    </Link>
  );
}
