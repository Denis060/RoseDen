-- RoseDen OS public storefront.
-- Run after migration 006. Safe to run more than once.

alter table public.inventory
  add column if not exists is_public boolean not null default false,
  add column if not exists is_featured boolean not null default false,
  add column if not exists public_status text not null default 'hidden',
  add column if not exists public_description text not null default '',
  add column if not exists slug text,
  add column if not exists sizes text[] not null default '{}',
  add column if not exists colors text[] not null default '{}',
  add column if not exists source_type text not null default 'ready-made';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inventory_public_status_check'
  ) then
    alter table public.inventory add constraint inventory_public_status_check
      check (public_status in ('available', 'reserved', 'sold', 'hidden'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'inventory_source_type_check'
  ) then
    alter table public.inventory add constraint inventory_source_type_check
      check (source_type in ('ready-made', 'original', 'tailoring-sample'));
  end if;
end $$;

update public.inventory
set
  slug = lower(trim(both '-' from regexp_replace(product_name || '-' || left(id::text, 8), '[^a-zA-Z0-9]+', '-', 'g'))),
  sizes = case when size = '' then '{}'::text[] else array[size] end,
  colors = case when color = '' then '{}'::text[] else array[color] end
where slug is null;

create unique index if not exists inventory_public_slug_unique
on public.inventory(slug)
where slug is not null;

drop policy if exists "public read published inventory" on public.inventory;
create policy "public read published inventory"
on public.inventory for select to anon
using (is_public = true and public_status = 'available');

-- Public visitors may read storefront fields only. Cost, supplier, and internal
-- stock-management fields remain available only to authenticated staff.
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
  created_at,
  updated_at
) on table public.inventory to anon;

create table if not exists public.business_settings (
  id text primary key default 'roseden',
  whatsapp_number text not null default '',
  phone_number text not null default '',
  location text not null default 'Makeni, Bombali District, Sierra Leone',
  opening_hours text not null default 'Monday - Saturday, 9:00 AM - 6:00 PM',
  instagram_url text not null default '',
  facebook_url text not null default '',
  tiktok_url text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id)
values ('roseden')
on conflict (id) do nothing;

alter table public.business_settings enable row level security;

drop policy if exists "public read business settings" on public.business_settings;
create policy "public read business settings"
on public.business_settings for select to anon, authenticated using (true);

grant select on table public.business_settings to anon, authenticated;

drop policy if exists "admin update business settings" on public.business_settings;
create policy "admin update business settings"
on public.business_settings for update to authenticated
using (public.is_admin())
with check (public.is_admin());
