-- RoseDen OS v1.5: buying batches, reservations, media, and channel attribution.

create type public.product_status as enum ('available', 'reserved', 'paid', 'delivered', 'cancelled');
create type public.delivery_plan as enum ('pickup', 'delivery');

create table public.post_batches (
  id uuid primary key default gen_random_uuid(),
  batch_name text not null,
  source text not null,
  purchase_date date not null default current_date,
  total_cost numeric(12,2) not null default 0 check (total_cost >= 0),
  transport_cost numeric(12,2) not null default 0 check (transport_cost >= 0),
  channels text[] not null default '{}',
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.inventory
  add column status public.product_status not null default 'available',
  add column size text not null default '',
  add column color text not null default '',
  add column supplier_photo_url text,
  add column shop_photo_url text,
  add column try_on_url text,
  add column batch_id uuid references public.post_batches(id) on delete set null;

alter table public.orders
  add column acquisition_channel text not null default 'Walk-in',
  add column color text not null default '',
  add column size text not null default '',
  add column delivery_plan public.delivery_plan not null default 'pickup';

-- Content and leads establish the v2 architecture without complicating the v1.5 UI.
create table public.content (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete set null,
  content_type text not null check (content_type in ('photo', 'video', 'story', 'reel', 'other')),
  caption text not null default '',
  media_url text,
  posted_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.content_channels (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content(id) on delete cascade,
  channel text not null,
  inquiries integer not null default 0 check (inquiries >= 0),
  reservations integer not null default 0 check (reservations >= 0),
  sales integer not null default 0 check (sales >= 0),
  revenue numeric(12,2) not null default 0 check (revenue >= 0),
  unique (content_id, channel)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  inventory_id uuid references public.inventory(id) on delete set null,
  content_id uuid references public.content(id) on delete set null,
  source_channel text not null,
  inquiry_date timestamptz not null default now(),
  status text not null default 'inquiry' check (status in ('inquiry', 'reserved', 'converted', 'lost')),
  order_id uuid references public.orders(id) on delete set null,
  notes text not null default '',
  created_by uuid references public.profiles(id)
);

create or replace function public.set_inventory_sale_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare order_total numeric(12,2);
declare amount_paid numeric(12,2);
begin
  if new.inventory_id is null then return new; end if;

  select total_price into order_total from public.orders where id = new.order_id;
  select coalesce(sum(amount), 0) into amount_paid from public.payments where order_id = new.order_id;

  update public.inventory
  set status = case when amount_paid >= order_total then 'paid' else 'reserved' end
  where id = new.inventory_id;
  return new;
end;
$$;

create trigger set_inventory_status_after_order_item
after insert on public.order_items for each row execute procedure public.set_inventory_sale_status();

create or replace function public.refresh_inventory_status_after_payment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.inventory inventory_item
  set status = case
    when (select coalesce(sum(amount), 0) from public.payments where order_id = new.order_id)
      >= (select total_price from public.orders where id = new.order_id)
    then 'paid'
    else 'reserved'
  end
  where inventory_item.id in (
    select inventory_id from public.order_items
    where order_id = new.order_id and inventory_id is not null
  );
  return new;
end;
$$;

create trigger refresh_inventory_status_on_payment
after insert or update on public.payments
for each row execute procedure public.refresh_inventory_status_after_payment();

create or replace function public.sync_inventory_delivery_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status in ('delivered', 'cancelled') and new.status is distinct from old.status then
    if new.status = 'cancelled' then
      update public.inventory inventory_item
      set
        quantity = inventory_item.quantity + order_item.quantity,
        status = 'available'
      from public.order_items order_item
      where order_item.order_id = new.id
        and order_item.inventory_id = inventory_item.id;
    else
      update public.inventory
      set status = 'delivered'
      where id in (
        select inventory_id from public.order_items
        where order_id = new.id and inventory_id is not null
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger sync_inventory_status_on_order
after update of status on public.orders
for each row execute procedure public.sync_inventory_delivery_status();

alter table public.post_batches enable row level security;
alter table public.content enable row level security;
alter table public.content_channels enable row level security;
alter table public.leads enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['post_batches','content','content_channels','leads']
  loop
    execute format('create policy "authenticated read %1$s" on public.%1$I for select to authenticated using (true)', table_name);
    execute format('create policy "authenticated insert %1$s" on public.%1$I for insert to authenticated with check (true)', table_name);
    execute format('create policy "authenticated update %1$s" on public.%1$I for update to authenticated using (true)', table_name);
    execute format('create policy "admin delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin())', table_name);
  end loop;
end $$;

create index inventory_batch_idx on public.inventory(batch_id);
create index orders_channel_idx on public.orders(acquisition_channel);
create index content_inventory_idx on public.content(inventory_id);
create index leads_channel_idx on public.leads(source_channel);
create index leads_order_idx on public.leads(order_id);
