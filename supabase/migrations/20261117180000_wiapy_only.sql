-- Ensure the store accepts Wiapy only; no alternate provider is enabled.
alter table public.orders
  drop constraint if exists orders_payment_provider_check;

alter table public.orders
  add constraint orders_payment_provider_check
  check (payment_provider = 'wiapy');

alter table public.orders
  alter column payment_provider set default 'wiapy';

comment on column public.orders.payment_provider is
  'Wiapy is the only payment provider enabled for this store.';
