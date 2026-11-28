alter table public.orders drop constraint if exists orders_payment_provider_check;
alter table public.orders add constraint orders_payment_provider_check check (payment_provider in ('wiapy','asaas'));
alter table public.orders alter column payment_provider set default 'asaas';
alter table public.orders add column if not exists asaas_customer_id text, add column if not exists payment_checked_at timestamptz;
create table public.asaas_payment_events (id text primary key, order_id uuid not null references public.orders(id), created_at timestamptz not null default now());
grant all on public.asaas_payment_events to service_role;
alter table public.asaas_payment_events enable row level security;
create or replace function public.apply_asaas_payment(p_order_id uuid, p_payment_id text, p_status text, p_event_id text default null) returns boolean language plpgsql security invoker set search_path=public as $$
declare changed boolean := false; current_status text;
begin
select payment_status into current_status from public.orders where id=p_order_id and payment_provider='asaas' for update;
if not found then return false; end if;
if p_event_id is not null and exists(select 1 from public.asaas_payment_events where id=p_event_id) then return false; end if;
if p_status='approved' and current_status in ('pending','chargedback') then
update public.orders set payment_status='approved', provider_payment_id=p_payment_id, paid_at=coalesce(paid_at,now()),updated_at=now() where id=p_order_id; changed:=true;
elsif p_status in ('refunded','chargedback','cancelled') and current_status <> 'refunded' then
update public.orders set payment_status=p_status,provider_payment_id=p_payment_id,updated_at=now() where id=p_order_id; changed:=true;
end if;
if p_event_id is not null then insert into public.asaas_payment_events(id,order_id) values(p_event_id,p_order_id); end if;
return changed;
end $$;
revoke all on function public.apply_asaas_payment(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.apply_asaas_payment(uuid,text,text,text) to service_role;