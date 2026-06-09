-- Phase 6B.1: use the final eight phone digits as the customer identity.
-- This treats +232 76 123 456 and 076 123 456 as the same customer.

alter table public.customers
add column if not exists phone_key text generated always as (
  right(regexp_replace(phone, '[^0-9]', '', 'g'), 8)
) stored;

create unique index if not exists customers_phone_key_unique
on public.customers(phone_key)
where length(phone_key) = 8;

create index if not exists customers_phone_key_search_idx
on public.customers(phone_key);
