-- Allow published product pages to show the optional product or try-on video.
-- Run after migration 016. Safe to run more than once.

alter table public.inventory
  add column if not exists try_on_url text;

grant select (try_on_url) on table public.inventory to anon;
