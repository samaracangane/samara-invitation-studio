-- Replace the old store categories while preserving existing invite records.
update public.invites
set category = case category
  when 'Infantil' then 'Desenhos Animados'
  when 'Casamento' then 'Jardim Encantado'
  when '15 Anos' then 'Princesas'
  when 'Outros' then 'Desenhos Animados'
  else category
end
where category in ('Infantil', 'Casamento', '15 Anos', 'Outros');

alter table public.invites
  drop constraint if exists invites_category_check;

alter table public.invites
  add constraint invites_category_check
  check (category in ('Mickey', 'Minnie', 'Bluey', 'Alice', 'Dos Rosa', 'Guerreiras K-Pop', 'Desenhos Animados', 'Princesas', 'Super Herói', 'Fundo do Mar', 'Dinossauro', 'Toy Story', 'Barbie', 'Hello Kitty', 'Fazendinha', 'Circo', 'Safari', 'Jardim Encantado', '365 Sorrisos', 'Patrulha Canina'));
