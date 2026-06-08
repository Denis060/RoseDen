-- RoseDen OS Phase 2.5: simple website content management.
-- Run after migration 008. Safe to run more than once.

alter table public.business_settings
  add column if not exists email text not null default 'roseden.atelier@gmail.com',
  add column if not exists hero_title text not null default 'Styled for you. Made for your moment.',
  add column if not exists hero_subtitle text not null default 'Tailored pieces, curated fashion, and one-of-one RoseDen Originals for women who love to stand out.',
  add column if not exists hero_image_url text not null default '/images/roseden-boutique-concept.png',
  add column if not exists about_title text not null default 'Fashion with heart, personality, and purpose.',
  add column if not exists about_body text not null default 'RoseDen brings together creative styling, thoughtful tailoring, carefully chosen pieces, and one-of-one Originals.',
  add column if not exists about_image_url text not null default '/images/showcase/arrival-burgundy.png',
  add column if not exists tailoring_title text not null default 'Tailored to feel like you.',
  add column if not exists tailoring_body text not null default 'Personal measurements, thoughtful fittings, and occasion pieces made with care.',
  add column if not exists tailoring_image_url text not null default '/images/showcase/original-gold.png',
  add column if not exists contact_image_url text not null default '/images/roseden-boutique-concept.png',
  add column if not exists atelier_images jsonb not null default '[]'::jsonb,
  add column if not exists testimonials jsonb not null default '[
    {"name":"Aminata K.","quote":"Beautiful pieces that always get compliments.","location":"Makeni","rating":5},
    {"name":"Fatmata J.","quote":"The fitting makes the outfit feel made just for me.","location":"Freetown","rating":5},
    {"name":"Binta M.","quote":"My go-to boutique for statement looks in Makeni.","location":"Makeni","rating":5}
  ]'::jsonb,
  add column if not exists tailoring_services jsonb not null default '[
    {"title":"Bespoke tailoring","description":"Made for your shape and your moment."},
    {"title":"Measurements & fittings","description":"Careful fitting for a confident finish."},
    {"title":"Bridal & occasion wear","description":"For life''s special moments."},
    {"title":"Styling support","description":"Help choosing pieces, colors, and complete looks."},
    {"title":"Pickup & delivery","description":"Arrange collection or delivery when ordering."}
  ]'::jsonb;

alter table public.inventory
  add column if not exists product_images text[] not null default '{}';

update public.inventory
set product_images = array_remove(array[
  nullif(shop_photo_url, ''),
  nullif(supplier_photo_url, ''),
  nullif(photo_url, '')
], null)
where cardinality(product_images) = 0;

revoke all on table public.business_settings from anon;
grant select (
  id, whatsapp_number, phone_number, location, opening_hours,
  instagram_url, facebook_url, tiktok_url, email,
  hero_title, hero_subtitle, hero_image_url,
  about_title, about_body, about_image_url,
  tailoring_title, tailoring_body, tailoring_image_url,
  contact_image_url, atelier_images, testimonials, tailoring_services,
  updated_at
) on table public.business_settings to anon;
grant select on table public.business_settings to authenticated;
grant update on table public.business_settings to authenticated;

revoke all on table public.inventory from anon;
grant select (
  id, product_name, category, selling_price, quantity, photo_url,
  supplier_photo_url, shop_photo_url, product_images, color, size,
  is_public, is_featured, public_status, public_description, slug,
  sizes, colors, source_type, created_at
) on table public.inventory to anon;
