create table if not exists public.category_media (
  category text primary key,
  image_url text not null,
  updated_at timestamptz not null default now()
);

alter table public.category_media enable row level security;

drop policy if exists "Public can view category photos" on public.category_media;
create policy "Public can view category photos"
  on public.category_media for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage category photos" on public.category_media;
create policy "Admins manage category photos"
  on public.category_media for all
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
