-- Samara Criar Arts: pedidos com valor calculado no servidor.
-- O cliente nunca envia o valor final como fonte confiavel.
-- A Edge Function consulta o preco do convite no banco e cria um checkout por pedido.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invite_id text not null,
  invite_name text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  customer_name text,
  customer_email text,
  payment_provider text not null default 'mercado_pago'
    check (payment_provider in ('mercado_pago')),
  provider_checkout_id text,
  checkout_url text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending','approved','rejected','cancelled','refunded')),
  provider_payment_id text,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_provider_payment_id_idx on public.orders (provider_payment_id);

alter table public.orders enable row level security;

-- No public policies: reads/writes are performed only by trusted server functions
-- using the Supabase service-role key. Never expose that key in the browser.

comment on table public.orders is
  'Pedidos da loja; valor calculado no servidor a partir do preco cadastrado do convite.';
comment on column public.orders.amount_cents is
  'Valor congelado em centavos no momento do pedido; nao aceitar valor do navegador.';
comment on column public.orders.idempotency_key is
  'Chave unica para evitar pedidos duplicados em repeticoes da mesma solicitacao.';
