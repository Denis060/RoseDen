-- Phase 1, step 1 of 4: keep available stock correct when order items change.
-- Safe to run more than once.

drop trigger if exists set_inventory_status_after_order_item on public.order_items;
drop trigger if exists refresh_inventory_status_on_payment on public.payments;
drop trigger if exists sync_inventory_status_on_order on public.orders;
drop trigger if exists reduce_inventory_after_sale on public.order_items;
drop trigger if exists sync_available_inventory_on_order_item on public.order_items;

create or replace function public.sync_available_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_counts boolean := false;
  new_counts boolean := false;
begin
  if tg_op in ('UPDATE', 'DELETE') and old.inventory_id is not null then
    select status <> 'cancelled'
    into old_counts
    from public.orders
    where id = old.order_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.inventory_id is not null then
    select status <> 'cancelled'
    into new_counts
    from public.orders
    where id = new.order_id;
  end if;

  if tg_op in ('UPDATE', 'DELETE') and old.inventory_id is not null and old_counts then
    update public.inventory
    set quantity = quantity + old.quantity
    where id = old.inventory_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.inventory_id is not null and new_counts then
    update public.inventory
    set quantity = quantity - new.quantity
    where id = new.inventory_id
      and quantity >= new.quantity;

    if not found then
      raise exception 'Not enough available inventory';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger sync_available_inventory_on_order_item
after insert or update or delete on public.order_items
for each row execute function public.sync_available_inventory();

