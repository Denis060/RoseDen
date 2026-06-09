-- Phase 4B, step 5 of 5: admin-only restocking and image management.
-- Safe to run more than once.

create or replace function public.restock_inventory(
  target_inventory_id uuid,
  stock_quantity integer,
  new_unit_cost numeric,
  new_supplier_source text default '',
  target_batch_id uuid default null,
  stock_notes text default ''
)
returns public.inventory
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_inventory public.inventory;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can restock inventory';
  end if;

  if stock_quantity <= 0 then
    raise exception 'Restock quantity must be greater than zero';
  end if;

  insert into public.inventory_stock_entries (
    inventory_id, quantity, unit_cost, supplier_source, batch_id, notes, created_by
  ) values (
    target_inventory_id, stock_quantity, new_unit_cost,
    coalesce(new_supplier_source, ''), target_batch_id,
    coalesce(stock_notes, ''), auth.uid()
  );

  update public.inventory
  set
    quantity = quantity + stock_quantity,
    cost_price = new_unit_cost,
    supplier_source = coalesce(nullif(new_supplier_source, ''), supplier_source),
    batch_id = coalesce(target_batch_id, batch_id),
    status = 'available'
  where id = target_inventory_id
  returning * into updated_inventory;

  if updated_inventory.id is null then
    raise exception 'Product not found';
  end if;

  return updated_inventory;
end;
$$;

drop policy if exists "authenticated upload product images" on storage.objects;
drop policy if exists "authenticated update product images" on storage.objects;
drop policy if exists "authenticated delete product images" on storage.objects;
drop policy if exists "admin upload product images" on storage.objects;
drop policy if exists "admin update product images" on storage.objects;
drop policy if exists "admin delete product images" on storage.objects;

create policy "admin upload product images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin update product images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin delete product images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

