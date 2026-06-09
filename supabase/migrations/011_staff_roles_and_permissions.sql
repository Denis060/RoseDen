-- Phase 4B: staff directory, role management, and enforced permissions.
-- Safe to run more than once. Run after migration 010.

alter table public.profiles
  add column if not exists email text not null default '';

update public.profiles profile
set email = coalesce(auth_user.email, '')
from auth.users auth_user
where auth_user.id = profile.id
  and profile.email is distinct from coalesce(auth_user.email, '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    case
      when not exists (select 1 from public.profiles) then 'admin'::public.user_role
      else 'staff'::public.user_role
    end
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    email = excluded.email;

  return new;
end;
$function$;

drop policy if exists "authenticated read profiles" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;

create policy "users read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "admins read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "users update own profile" on public.profiles;
revoke update on public.profiles from authenticated;

create or replace function public.list_staff_members()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can view staff accounts';
  end if;

  return query
  select profile.id, profile.full_name, profile.email, profile.role, profile.created_at
  from public.profiles profile
  order by
    case when profile.role = 'admin' then 0 else 1 end,
    profile.created_at;
end;
$function$;

create or replace function public.set_staff_access(
  target_user_id uuid,
  new_full_name text,
  new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $function$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change staff access';
  end if;

  if target_user_id = auth.uid() and new_role <> 'admin'::public.user_role then
    raise exception 'You cannot remove your own administrator access';
  end if;

  update public.profiles
  set
    full_name = trim(coalesce(new_full_name, '')),
    role = new_role
  where id = target_user_id;

  if not found then
    raise exception 'Staff account not found';
  end if;
end;
$function$;

grant execute on function public.list_staff_members() to authenticated;
grant execute on function public.set_staff_access(uuid, text, public.user_role) to authenticated;

do $$
begin
  if to_regprocedure('public.record_audit_log()') is not null then
    drop trigger if exists audit_changes on public.profiles;
    create trigger audit_changes
      after insert or update or delete on public.profiles
      for each row execute function public.record_audit_log();
  end if;
end
$$;

-- Inventory and buying trips are admin-managed. Staff can still read inventory
-- and order triggers can still reserve/sell stock through security-definer functions.
drop policy if exists "authenticated insert inventory" on public.inventory;
drop policy if exists "authenticated update inventory" on public.inventory;
drop policy if exists "admin insert inventory" on public.inventory;
drop policy if exists "admin update inventory" on public.inventory;

create policy "admin insert inventory"
  on public.inventory for insert to authenticated
  with check (public.is_admin());

create policy "admin update inventory"
  on public.inventory for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "authenticated insert inventory_stock_entries" on public.inventory_stock_entries;
drop policy if exists "authenticated update inventory_stock_entries" on public.inventory_stock_entries;
drop policy if exists "admin insert inventory_stock_entries" on public.inventory_stock_entries;
drop policy if exists "admin update inventory_stock_entries" on public.inventory_stock_entries;

create policy "admin insert inventory_stock_entries"
  on public.inventory_stock_entries for insert to authenticated
  with check (public.is_admin());

create policy "admin update inventory_stock_entries"
  on public.inventory_stock_entries for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "authenticated insert post_batches" on public.post_batches;
drop policy if exists "authenticated update post_batches" on public.post_batches;
drop policy if exists "admin insert post_batches" on public.post_batches;
drop policy if exists "admin update post_batches" on public.post_batches;

create policy "admin insert post_batches"
  on public.post_batches for insert to authenticated
  with check (public.is_admin());

create policy "admin update post_batches"
  on public.post_batches for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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
as $function$
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
$function$;

-- Migration 009 grants the table privilege broadly, while this RLS policy keeps
-- actual updates restricted to admins.
drop policy if exists "admin update business settings" on public.business_settings;
create policy "admin update business settings"
  on public.business_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

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
