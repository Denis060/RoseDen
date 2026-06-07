-- Phase 1, step 2 of 4: return stock on cancellation and reserve it on reopening.
-- Safe to run more than once.

drop trigger if exists sync_available_inventory_on_order_status on public.orders;

create or replace function public.sync_available_inventory_on_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  required_item record;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.inventory inventory_item
    set quantity = inventory_item.quantity + order_item.quantity
    from public.order_items order_item
    where order_item.order_id = new.id
      and order_item.inventory_id = inventory_item.id;
  end if;

  if old.status = 'cancelled' and new.status <> 'cancelled' then
    for required_item in
      select inventory_id, quantity
      from public.order_items
      where order_id = new.id
        and inventory_id is not null
    loop
      update public.inventory
      set quantity = quantity - required_item.quantity
      where id = required_item.inventory_id
        and quantity >= required_item.quantity;

      if not found then
        raise exception 'Not enough available inventory to reopen this order';
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create trigger sync_available_inventory_on_order_status
after update of status on public.orders
for each row execute function public.sync_available_inventory_on_order_status();

