-- Cadastro inicial importado da loja Nuvemshop.
-- Mantido inativo até adicionar a imagem original do produto, para não exibir
-- uma miniatura de outro tema por engano.
insert into public.invites (
  slug, name, category, description, price, image_url, video_url, fields, is_active
)
values (
  'convite-digital-simples-mickey-mouse',
  'Convite Digital Simples Mickey Mouse',
  'Mickey',
  'Convite digital personalizado, enviado por WhatsApp em até 24 horas após a confirmação do pedido. Para personalizar, informe telefone com DDD, nome e idade do aniversariante, data, horário e endereço da festa.',
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
  is_active = false,
  updated_at = now();
