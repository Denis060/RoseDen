-- Homepage product selection and ordering.
-- Run after migration 019. Safe to run more than once.

do $migration$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'inventory'
      and column_name = 'homepage_order'
  ) then
    alter table public.inventory
      add column homepage_order integer not null default 1000;

    with ranked as (
      select id, (row_number() over (order by created_at desc, id) * 10)::integer as position
      from public.inventory
      where is_public = true and public_status <> 'hidden'
    )
    update public.inventory inventory_item
    set is_featured = true,
        homepage_order = ranked.position
    from ranked
    where inventory_item.id = ranked.id;
  end if;
end
$migration$;

create index if not exists inventory_homepage_merchandising_idx
  on public.inventory (is_featured, homepage_order)
  where is_public = true and public_status <> 'hidden';

grant select (homepage_order) on table public.inventory to anon;
