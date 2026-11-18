insert into public.invites (
  slug,
  name,
  category,
  description,
  price,
  image_url,
  video_url,
  fields,
  is_active
)
values (
  'convite-digital-safari-mickey',
  'Convite Digital Safari do Mickey',
  'Mickey',
  'Convite digital personalizado com tema Safari do Mickey. Após a confirmação do pedido, o convite será preparado com os dados da festa e enviado digitalmente.',
  15.00,
  null,
  null,
  '[]'::jsonb,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  image_url = coalesce(public.invites.image_url, excluded.image_url),
  fields = excluded.fields,
  is_active = false,
  updated_at = now();
