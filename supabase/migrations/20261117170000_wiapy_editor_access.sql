-- Customer design persistence and Wiapy offer-tier checkout.
-- One generic Wiapy product can be configured with up to 10 offers; each price tier
-- maps to its own offer URL while sharing the same checkout ID.

alter table public.orders
  add column if not exists access_token_hash text,
  add column if not exists paid_at timestamptz,
  add column if not exists offer_id uuid;

create table if not exists public.wiapy_offers (
  id uuid primary key default gen_random_uuid(),
  price_cents integer not null unique check (price_cents >= 190),
  checkout_id text not null,
  checkout_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_offer_id_fkey
  foreign key (offer_id) references public.wiapy_offers(id) on delete set null;

create table if not exists public.invite_designs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  invite_id text not null,
  design_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.wiapy_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_payment_id text not null unique,
  provider_checkout_id text,
  amount_cents integer,
  provider_status text not null,
  matched_order_id uuid references public.orders(id) on delete set null,
  received_at timestamptz not null default now()
);

create index if not exists wiapy_offers_active_price_idx
  on public.wiapy_offers (price_cents) where is_active = true;

create index if not exists invite_designs_updated_at_idx
  on public.invite_designs (updated_at desc);

alter table public.wiapy_offers enable row level security;
alter table public.invite_designs enable row level security;
alter table public.wiapy_webhook_events enable row level security;

drop policy if exists "Admins manage Wiapy offers" on public.wiapy_offers;
create policy "Admins manage Wiapy offers" on public.wiapy_offers
  for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Orders, saved designs and webhook events have no public policies.
-- Only trusted Edge Functions using the service-role key can access them.

comment on table public.wiapy_offers is
  'Wiapy offer links keyed by price tier. Configure one generic product and up to 10 offers in a Wiapy checkout.';
comment on table public.invite_designs is
  'Customer-edited invitation layers, saved only after the associated order is approved.';
