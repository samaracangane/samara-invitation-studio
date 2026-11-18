-- Wiapy support for orders. Keep historical Mercado Pago values readable,
-- but use Wiapy as the default for all new orders.
alter table public.orders
  alter column payment_provider set default 'wiapy';

alter table public.orders
  drop constraint if exists orders_payment_provider_check;

alter table public.orders
  add constraint orders_payment_provider_check
  check (payment_provider in ('wiapy'));

alter table public.orders
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_status_check
  check (payment_status in ('pending','approved','rejected','cancelled','refunded','chargedback'));

create unique index if not exists orders_provider_payment_unique_idx
  on public.orders (payment_provider, provider_payment_id)
  where provider_payment_id is not null;

comment on column public.orders.payment_provider is
  'Wiapy e o unico provedor de pagamento habilitado para novos pedidos.';
