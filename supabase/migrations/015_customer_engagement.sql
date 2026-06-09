-- Phase 6C: approval-first WhatsApp follow-ups and customer engagement history.
-- Safe to run after migrations 001 through 014.

alter table public.customers
add column if not exists birthday date;

create table if not exists public.customer_follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  follow_up_type text not null
    check (follow_up_type in ('balance', 'order_ready', 'overdue', 'review', 'birthday', 'general')),
  channel text not null default 'WhatsApp',
  message_text text not null,
  contacted_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.customer_follow_ups enable row level security;

drop policy if exists "staff can read customer follow ups" on public.customer_follow_ups;
create policy "staff can read customer follow ups"
on public.customer_follow_ups
for select
to authenticated
using (true);

drop policy if exists "staff can create customer follow ups" on public.customer_follow_ups;
create policy "staff can create customer follow ups"
on public.customer_follow_ups
for insert
to authenticated
with check (true);

drop policy if exists "admin can delete customer follow ups" on public.customer_follow_ups;
create policy "admin can delete customer follow ups"
on public.customer_follow_ups
for delete
to authenticated
using (public.is_admin());

grant select, insert on public.customer_follow_ups to authenticated;
grant delete on public.customer_follow_ups to authenticated;

create index if not exists customer_follow_ups_customer_idx
on public.customer_follow_ups(customer_id, contacted_at desc);

create index if not exists customer_follow_ups_order_idx
on public.customer_follow_ups(order_id, contacted_at desc);

create index if not exists customers_birthday_idx
on public.customers(birthday)
where birthday is not null;

