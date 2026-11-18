alter table public.invites add column if not exists image_urls text[] not null default '{}';
alter table public.orders add column if not exists customer_whatsapp text;
