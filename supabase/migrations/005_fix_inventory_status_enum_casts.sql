-- Fix enum casts in inventory status triggers for already-migrated databases.
-- Safe to run more than once.

create or replace function public.set_inventory_sale_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare order_total numeric(12,2);
declare amount_paid numeric(12,2);
begin
  if new.inventory_id is null then return new; end if;

  select total_price into order_total from public.orders where id = new.order_id;
  select coalesce(sum(amount), 0) into amount_paid from public.payments where order_id = new.order_id;

  update public.inventory
  set status = case
    when amount_paid >= order_total then 'paid'::public.product_status
    else 'reserved'::public.product_status
  end
  where id = new.inventory_id;

  return new;
end;
$$;

create or replace function public.refresh_inventory_status_after_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.inventory inventory_item
  set status = case
    when (select coalesce(sum(amount), 0) from public.payments where order_id = new.order_id)
      >= (select total_price from public.orders where id = new.order_id)
    then 'paid'::public.product_status
    else 'reserved'::public.product_status
  end
  where inventory_item.id in (
    select inventory_id from public.order_items
    where order_id = new.order_id and inventory_id is not null
  );

  return new;
end;
$$;
