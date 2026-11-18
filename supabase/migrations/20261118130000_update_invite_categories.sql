-- Allow the 20 theme categories shown in the public catalog and admin form.
alter table public.invites
  drop constraint if exists invites_category_check;

alter table public.invites
  add constraint invites_category_check
  check (category in ('Mickey', 'Minnie', 'Bluey', 'Alice', 'Dos Rosa', 'Guerreiras K-Pop', 'Desenhos Animados', 'Princesas', 'Super Herói', 'Fundo do Mar', 'Dinossauro', 'Toy Story', 'Barbie', 'Hello Kitty', 'Fazendinha', 'Circo', 'Safari', 'Jardim Encantado', '365 Sorrisos', 'Patrulha Canina'));
