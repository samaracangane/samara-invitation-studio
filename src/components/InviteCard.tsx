import { Link } from "@tanstack/react-router";
import type { Invite } from "@/data/invites";

export function InviteCard({ invite }: { invite: Invite }) {
  return (
    <Link to="/convite/$id" params={{ id: invite.id }} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-secondary">
        {invite.video ? (
          <video src={invite.video} poster={invite.image} autoPlay muted loop playsInline className="aspect-[4/7] w-full object-cover transition group-hover:scale-105" />
        ) : (
          <img src={invite.image} alt={invite.name} loading="lazy" width={768} height={1344} className="aspect-[4/7] w-full object-cover transition group-hover:scale-105" />
        )}
        {invite.video && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Animado</span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{invite.category}</p>
      <h3 className="font-display text-xl">{invite.name}</h3>
      <p className="text-sm font-medium text-primary">{invite.price}</p>
    </Link>
  );
}
