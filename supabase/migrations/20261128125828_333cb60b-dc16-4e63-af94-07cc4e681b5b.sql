alter table public.orders add column checkout_claimed_at timestamptz;
create or replace function public.claim_asaas_checkout(p_order_id uuid) returns boolean language plpgsql security invoker set search_path=public as $$
begin
update public.orders set checkout_claimed_at=now() where id=p_order_id and payment_provider='asaas' and payment_status='pending' and (checkout_claimed_at is null or checkout_claimed_at < now()-interval '2 minutes');
return found;
end $$;
revoke all on function public.claim_asaas_checkout(uuid) from public,anon,authenticated;
grant execute on function public.claim_asaas_checkout(uuid) to service_role;
create or replace function public.claim_asaas_check(p_order_id uuid) returns boolean language plpgsql security invoker set search_path=public as $$
begin
update public.orders set payment_checked_at=now() where id=p_order_id and payment_provider='asaas' and (payment_checked_at is null or payment_checked_at < now()-interval '20 seconds');
return found;
end $$;
revoke all on function public.claim_asaas_check(uuid) from public,anon,authenticated;
grant execute on function public.claim_asaas_check(uuid) to service_role;