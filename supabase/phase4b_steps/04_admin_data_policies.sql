-- Phase 4B, step 4 of 5: protect inventory, buying trips, and website settings.
-- Safe to run more than once.

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

drop policy if exists "authenticated insert inventory_stock_entries"
  on public.inventory_stock_entries;
drop policy if exists "authenticated update inventory_stock_entries"
  on public.inventory_stock_entries;
drop policy if exists "admin insert inventory_stock_entries"
  on public.inventory_stock_entries;
drop policy if exists "admin update inventory_stock_entries"
  on public.inventory_stock_entries;

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

drop policy if exists "admin update business settings"
  on public.business_settings;

create policy "admin update business settings"
  on public.business_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

