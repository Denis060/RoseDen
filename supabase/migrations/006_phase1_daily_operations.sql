-- RoseDen OS Phase 1: dependable order edits, quantity accounting, and images.
-- Forward-only and safe to run after migrations 001-005.

-- Product status cannot describe mixed quantities (for example, 3 available
-- and 1 reserved). Keep the column for compatibility, but stop order/payment
-- triggers from changing the whole product.
drop trigger if exists set_inventory_status_after_order_item on public.order_items;
drop trigger if exists refresh_inventory_status_on_payment on public.payments;
drop trigger if exists sync_inventory_status_on_order on public.orders;
drop trigger if exists sync_available_inventory_on_order_item on public.order_items;
drop trigger if exists sync_available_inventory_on_order_status on public.orders;

-- Replace the original insert-only stock trigger with insert/update/delete
-- accounting. inventory.quantity always means units currently available.
drop trigger if exists reduce_inventory_after_sale on public.order_items;

create or replace function public.sync_available_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  old_counts boolean := false;
  new_counts boolean := false;
begin
  if tg_op in ('UPDATE', 'DELETE') and old.inventory_id is not null then
    select status <> 'cancelled' into old_counts
    from public.orders where id = old.order_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.inventory_id is not null then
    select status <> 'cancelled' into new_counts
    from public.orders where id = new.order_id;
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
$function$;

create trigger sync_available_inventory_on_order_item
after insert or update or delete on public.order_items
for each row execute function public.sync_available_inventory();

create or replace function public.sync_available_inventory_on_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  line record;
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
  elsif old.status = 'cancelled' and new.status <> 'cancelled' then
    for line in
      select inventory_id, quantity
      from public.order_items
      where order_id = new.id and inventory_id is not null
    loop
      update public.inventory
      set quantity = quantity - line.quantity
      where id = line.inventory_id
        and quantity >= line.quantity;

      if not found then
        raise exception 'Not enough available inventory to reopen this order';
      end if;
    end loop;
  end if;

  return new;
end;
$function$;

create trigger sync_available_inventory_on_order_status
after update of status on public.orders
for each row execute function public.sync_available_inventory_on_order_status();

create or replace view public.inventory_quantity_summary as
select
  inventory_item.id as inventory_id,
  inventory_item.quantity as available_quantity,
  coalesce(sum(order_item.quantity) filter (
    where customer_order.status not in ('delivered', 'cancelled')
  ), 0)::integer as reserved_quantity,
  coalesce(sum(order_item.quantity) filter (
    where customer_order.status = 'delivered'
  ), 0)::integer as sold_quantity,
  (
    inventory_item.quantity +
    coalesce(sum(order_item.quantity) filter (
      where customer_order.status <> 'cancelled'
    ), 0)
  )::integer as total_quantity
from public.inventory inventory_item
left join public.order_items order_item
  on order_item.inventory_id = inventory_item.id
left join public.orders customer_order
  on customer_order.id = order_item.order_id
group by inventory_item.id, inventory_item.quantity;

grant select on public.inventory_quantity_summary to authenticated;

-- Supabase Storage bucket for phone and browser product uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated upload product images" on storage.objects;
create policy "authenticated upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "authenticated update product images" on storage.objects;
create policy "authenticated update product images"
on storage.objects for update to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "authenticated delete product images" on storage.objects;
create policy "authenticated delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images');

create index if not exists order_items_inventory_status_idx
on public.order_items(inventory_id, order_id);
