-- Save the selected invite preview and allow customers to upload a reference photo for their paid order.
alter table public.orders
  add column if not exists invite_image_url text,
  add column if not exists customer_photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-uploads','customer-uploads',false,15728640,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.can_upload_order_photo(order_folder text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.id::text = order_folder
      and lower(o.customer_email) = lower(coalesce(auth.jwt()->>'email',''))
      and o.payment_status = 'approved'
  );
$$;

revoke all on function public.can_upload_order_photo(text) from public;
grant execute on function public.can_upload_order_photo(text) to authenticated;

drop policy if exists "Customers upload their paid order photo" on storage.objects;
create policy "Customers upload their paid order photo" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'customer-uploads'
    and public.can_upload_order_photo(split_part(name, '/', 1))
  );

drop policy if exists "Admins read customer uploaded photos" on storage.objects;
create policy "Admins read customer uploaded photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'customer-uploads'
    and exists (select 1 from public.admin_users a where a.user_id = auth.uid())
  );
