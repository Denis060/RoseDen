-- RoseDen OS v1.6: reusable customer/product memory and stock-entry history.

create extension if not exists pg_trgm;

alter table public.customers
  add column normalized_phone text generated always as (
    regexp_replace(phone, '[^0-9]', '', 'g')
  ) stored;

alter table public.inventory
  add column sku text,
  add column search_text text generated always as (
    lower(
      coalesce(product_name, '') || ' ' ||
      coalesce(category, '') || ' ' ||
      coalesce(color, '') || ' ' ||
      coalesce(size, '')
    )
  ) stored;

create table public.inventory_stock_entries (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null check (unit_cost >= 0),
  supplier_source text not null default '',
  batch_id uuid references public.post_batches(id) on delete set null,
  notes text not null default '',
  stocked_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

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
declare updated_inventory public.inventory;
begin
  if stock_quantity <= 0 then
    raise exception 'Restock quantity must be greater than zero';
  end if;

  insert into public.inventory_stock_entries (
    inventory_id, quantity, unit_cost, supplier_source, batch_id, notes, created_by
  ) values (
    target_inventory_id, stock_quantity, new_unit_cost,
    coalesce(new_supplier_source, ''), target_batch_id, coalesce(stock_notes, ''), auth.uid()
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

alter table public.inventory_stock_entries enable row level security;

create policy "authenticated read inventory_stock_entries"
on public.inventory_stock_entries for select to authenticated using (true);

create policy "authenticated insert inventory_stock_entries"
on public.inventory_stock_entries for insert to authenticated with check (true);

create policy "authenticated update inventory_stock_entries"
on public.inventory_stock_entries for update to authenticated using (true);

create policy "admin delete inventory_stock_entries"
on public.inventory_stock_entries for delete to authenticated using (public.is_admin());

create unique index customers_normalized_phone_unique
on public.customers(normalized_phone)
where length(normalized_phone) >= 8;

create index customers_name_search_idx
on public.customers using gin (lower(name) gin_trgm_ops);

create index inventory_search_idx
on public.inventory using gin (search_text gin_trgm_ops);

create index inventory_stock_entries_product_idx
on public.inventory_stock_entries(inventory_id, stocked_at desc);

create unique index inventory_sku_unique
on public.inventory(sku)
where sku is not null;
