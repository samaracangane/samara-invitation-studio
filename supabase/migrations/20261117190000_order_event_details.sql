-- Store the party details supplied by the customer before checkout.
alter table public.orders
  add column if not exists event_details jsonb not null default '{}'::jsonb;

comment on column public.orders.event_details is
  'Customer-provided event details captured before payment; visible only to authorized administrators.';
