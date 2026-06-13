-- Editable photos for the people shown on the public About page.
-- Run after migration 018. Safe to run more than once.

alter table public.business_settings
  add column if not exists rosannah_image_url text not null default '/images/roseden-boutique-concept.png',
  add column if not exists denis_image_url text not null default '/images/showcase/original-patchwork.png';

grant select (rosannah_image_url, denis_image_url)
  on table public.business_settings to anon;
