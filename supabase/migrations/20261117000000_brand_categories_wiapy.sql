-- Samara Criar Arts: categorias da loja e checkout externo por produto.
-- Execute no Supabase SQL Editor ou aplique como migration.

alter table public.invites
  add column if not exists checkout_url text;

alter table public.invites
  drop constraint if exists invites_category_check;

alter table public.invites
  add constraint invites_category_check
  check (category in (
    'Infantil', 'Casamento', '15 Anos',
    'Mickey', 'Minnie', 'Bluey', 'Barbie',
    'Safari', 'Princesas', 'Outros'
  ));

comment on column public.invites.checkout_url is
  'Link individual do checkout Wiapy para este produto. Deve ser validado antes de ativar o produto.';
