-- Phase 1 retry: create only the inventory quantity summary view.
-- Run this if verify_phase1.sql says "inventory quantity view" is missing.

drop view if exists public.inventory_quantity_summary;

create view public.inventory_quantity_summary as
select
  inventory_item.id as inventory_id,
  inventory_item.quantity as available_quantity,
  coalesce(reserved_counts.reserved_quantity, 0)::integer as reserved_quantity,
  coalesce(sold_counts.sold_quantity, 0)::integer as sold_quantity,
  (
    inventory_item.quantity +
    coalesce(reserved_counts.reserved_quantity, 0) +
    coalesce(sold_counts.sold_quantity, 0)
  )::integer as total_quantity
from public.inventory inventory_item
left join (
  select
    order_item.inventory_id,
    sum(order_item.quantity)::integer as reserved_quantity
  from public.order_items order_item
  join public.orders customer_order
    on customer_order.id = order_item.order_id
  where customer_order.status in ('pending', 'in progress', 'ready')
    and order_item.inventory_id is not null
  group by order_item.inventory_id
) reserved_counts
  on reserved_counts.inventory_id = inventory_item.id
left join (
  select
    order_item.inventory_id,
    sum(order_item.quantity)::integer as sold_quantity
  from public.order_items order_item
  join public.orders customer_order
    on customer_order.id = order_item.order_id
  where customer_order.status = 'delivered'
    and order_item.inventory_id is not null
  group by order_item.inventory_id
) sold_counts
  on sold_counts.inventory_id = inventory_item.id;

grant select on public.inventory_quantity_summary to authenticated;

