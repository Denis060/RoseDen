-- Phase 6B: capture public product interest without pretending every click is a sale.
-- Safe to run after migrations 001 through 012.

create table if not exists public.product_inquiries (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete set null,
  product_name text not null,
  product_slug text not null default '',
  selected_size text not null default '',
  selected_color text not null default '',
  inquiry_code text not null default ('RD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  source_channel text not null default 'Website',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'converted', 'dismissed')),
  clicked_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_inquiries
add column if not exists inquiry_code text
not null default ('RD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));

create index if not exists product_inquiries_status_clicked_idx
on public.product_inquiries(status, clicked_at desc);

create unique index if not exists product_inquiries_code_idx
on public.product_inquiries(inquiry_code);

alter table public.product_inquiries enable row level security;

drop policy if exists "public can create product inquiries" on public.product_inquiries;
create policy "public can create product inquiries"
on public.product_inquiries
for insert
to anon, authenticated
with check (
  status = 'new'
  and source_channel = 'Website'
);

drop policy if exists "staff can read product inquiries" on public.product_inquiries;
create policy "staff can read product inquiries"
on public.product_inquiries
for select
to authenticated
using (true);

drop policy if exists "staff can update product inquiries" on public.product_inquiries;
create policy "staff can update product inquiries"
on public.product_inquiries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "admin can delete product inquiries" on public.product_inquiries;
create policy "admin can delete product inquiries"
on public.product_inquiries
for delete
to authenticated
using (public.is_admin());

grant insert on public.product_inquiries to anon;
grant select, insert, update on public.product_inquiries to authenticated;
grant delete on public.product_inquiries to authenticated;
