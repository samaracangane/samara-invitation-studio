alter table public.invites
  add column if not exists is_featured boolean not null default false,
  add column if not exists is_new boolean not null default false;
