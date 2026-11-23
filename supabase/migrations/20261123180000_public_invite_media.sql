-- Publicly serve invitation images/videos while keeping uploads restricted to admins.
insert into storage.buckets (id, name, public, file_size_limit)
values ('invite-media', 'invite-media', true, 104857600)
on conflict (id) do update set public = true;

drop policy if exists "Public can view invitation media" on storage.objects;
create policy "Public can view invitation media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'invite-media');

drop policy if exists "Admins upload invitation media" on storage.objects;
create policy "Admins upload invitation media"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invite-media'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins update invitation media" on storage.objects;
create policy "Admins update invitation media"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'invite-media'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  )
  with check (
    bucket_id = 'invite-media'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins delete invitation media" on storage.objects;
create policy "Admins delete invitation media"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'invite-media'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
