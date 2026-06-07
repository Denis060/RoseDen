-- Run after migration 006. This should return four rows marked "ready".

select 'inventory quantity view' as phase_1_check,
  case when exists (
    select 1
    from information_schema.views
    where table_schema = 'public'
      and table_name = 'inventory_quantity_summary'
  )
    then 'ready' else 'missing' end as status
union all
select 'order item stock trigger',
  case when exists (
    select 1 from pg_trigger
    where tgname = 'sync_available_inventory_on_order_item'
      and not tgisinternal
  ) then 'ready' else 'missing' end
union all
select 'order status stock trigger',
  case when exists (
    select 1 from pg_trigger
    where tgname = 'sync_available_inventory_on_order_status'
      and not tgisinternal
  ) then 'ready' else 'missing' end
union all
select 'product image bucket',
  case when exists (
    select 1 from storage.buckets where id = 'product-images'
  ) then 'ready' else 'missing' end;
