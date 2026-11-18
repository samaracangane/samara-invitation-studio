insert into public.invites (
  slug,
  name,
  category,
  description,
  price,
  is_active
)
values (
  'convite-animado-vingadores-baby-heroi',
  'Convite Animado Vingadores Baby Herói',
  'Super Herói',
  'Convite animado personalizado com tema Vingadores Baby Herói. Após a confirmação do pedido, o convite será preparado com os dados da festa e enviado digitalmente.',
  32.00,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  is_active = false,
  updated_at = now();
