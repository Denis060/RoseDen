-- Product occasion and styling tags.
-- Run after migration 017. Safe to run more than once.

alter table public.inventory
  add column if not exists occasions text[] not null default '{}';

grant select (occasions) on table public.inventory to anon;
