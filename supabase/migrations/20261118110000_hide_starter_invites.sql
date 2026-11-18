-- Hide starter catalog examples that were inserted by the original setup migration.
-- Keep the records for historical orders, but do not show them in the public store.
update public.invites
set is_active = false
where slug in (
  'idol-pop-animado',
  'idol-pop',
  'casamento-rosas',
  '15-anos-coroa',
  'safari-baby'
);
