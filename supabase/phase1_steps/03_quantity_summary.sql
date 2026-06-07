-- Phase 1, step 3 of 4: quantity summary used by the inventory screens.
-- Safe to run more than once.

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

create index if not exists order_items_inventory_status_idx
on public.order_items(inventory_id, order_id);

