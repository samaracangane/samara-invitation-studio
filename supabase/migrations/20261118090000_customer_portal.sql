-- Customer portal: orders are visible to their verified email only through an Edge Function.
alter table public.orders
  add column if not exists fulfillment_status text not null default 'waiting'
    check (fulfillment_status in ('waiting','in_progress','delivered')),
  add column if not exists final_video_path text,
  add column if not exists final_image_path text,
  add column if not exists final_pdf_path text,
  add column if not exists fulfilled_at timestamptz;

create index if not exists orders_customer_email_idx
  on public.orders (lower(customer_email), created_at desc);

-- Private bucket for personalized MP4, image, and PDF deliveries.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'customer-deliveries',
  'customer-deliveries',
  false,
  104857600,
  array['video/mp4','image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read customer orders" on public.orders;
create policy "Admins read customer orders" on public.orders
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins update customer orders" on public.orders;
create policy "Admins update customer orders" on public.orders
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins upload customer deliveries" on storage.objects;
create policy "Admins upload customer deliveries" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'customer-deliveries'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins update customer deliveries" on storage.objects;
create policy "Admins update customer deliveries" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'customer-deliveries'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  )
  with check (
    bucket_id = 'customer-deliveries'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins delete customer deliveries" on storage.objects;
create policy "Admins delete customer deliveries" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'customer-deliveries'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );

drop policy if exists "Admins read customer deliveries" on storage.objects;
create policy "Admins read customer deliveries" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'customer-deliveries'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
