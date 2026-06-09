-- Phase 6A: public merchandising for available, reserved, and sold products.
-- Safe to run more than once.

drop policy if exists "public read published inventory" on public.inventory;
create policy "public read published inventory"
on public.inventory for select to anon
using (is_public = true and public_status in ('available', 'reserved', 'sold'));

-- Keep the public column list intentionally limited. Cost, supplier, buying
-- trip, and internal stock history remain private.
revoke all on table public.inventory from anon;
grant select (
  id,
  product_name,
  category,
  selling_price,
  quantity,
  photo_url,
  supplier_photo_url,
  shop_photo_url,
  product_images,
  color,
  size,
  is_public,
  is_featured,
  public_status,
  public_description,
  slug,
  sizes,
  colors,
  source_type,
  created_at
) on table public.inventory to anon;

select 'public merchandising policy' as phase_6a_check,
  case when exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory'
      and policyname = 'public read published inventory'
      and qual like '%reserved%'
      and qual like '%sold%'
  ) then 'ready' else 'missing' end as status;
