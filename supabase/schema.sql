-- Samara Criar Art's: catálogo gerenciável e papéis administrativos.
-- Execute este arquivo no SQL Editor do projeto Supabase.

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null check (category in ('Infantil', 'Casamento', '15 Anos')),
  description text not null default '',
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  video_url text,
  fields jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;
alter table public.admin_users enable row level security;

-- Catálogo público: somente modelos ativos podem ser lidos sem login.
drop policy if exists "Public can read active invites" on public.invites;
create policy "Public can read active invites" on public.invites
  for select to anon, authenticated using (is_active = true);

-- Administradores autenticados podem gerenciar todos os modelos.
drop policy if exists "Admins manage invites" on public.invites;
create policy "Admins manage invites" on public.invites
  for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Usuários não podem se promover a administrador. A inclusão inicial deve ser feita
-- manualmente pelo proprietário no SQL Editor, após criar a conta em Authentication.
drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list" on public.admin_users
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invite-media', 'invite-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view invite media" on storage.objects;
create policy "Public can view invite media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'invite-media');

drop policy if exists "Admins upload invite media" on storage.objects;
create policy "Admins upload invite media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invite-media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins update invite media" on storage.objects;
create policy "Admins update invite media" on storage.objects
  for update to authenticated
  using (bucket_id = 'invite-media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (bucket_id = 'invite-media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins delete invite media" on storage.objects;
create policy "Admins delete invite media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'invite-media' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
