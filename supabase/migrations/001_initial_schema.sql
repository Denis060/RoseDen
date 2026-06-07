create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'staff');
create type public.order_type as enum ('tailoring', 'ready-made', 'original');
create type public.order_status as enum ('pending', 'in progress', 'ready', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'staff',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  address text not null default '',
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references public.customers(id) on delete cascade,
  bust numeric(6,2),
  waist numeric(6,2),
  hips numeric(6,2),
  shoulder numeric(6,2),
  height numeric(6,2),
  updated_at timestamptz not null default now()
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  location text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  category text not null check (category in ('dress','top','skirt','shoes','bag','accessory','fabric','other')),
  cost_price numeric(12,2) not null default 0 check (cost_price >= 0),
  selling_price numeric(12,2) not null default 0 check (selling_price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_source text,
  photo_url text,
  low_stock_at integer not null default 2 check (low_stock_at >= 0),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  order_type public.order_type not null,
  item_description text not null,
  total_price numeric(12,2) not null default 0 check (total_price >= 0),
  estimated_cost numeric(12,2) not null default 0 check (estimated_cost >= 0),
  due_date date,
  status public.order_status not null default 'pending',
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  inventory_id uuid references public.inventory(id) on delete set null,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category text not null check (category in ('transport','inventory purchase','rent','electricity','internet','tailoring labor','marketing','food','other')),
  amount numeric(12,2) not null check (amount > 0),
  notes text not null default '',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null default 'cash',
  paid_at timestamptz not null default now(),
  notes text not null default '',
  created_by uuid references public.profiles(id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.reduce_inventory_on_order_item()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.inventory_id is not null then
    update public.inventory
    set quantity = quantity - new.quantity
    where id = new.inventory_id and quantity >= new.quantity;
    if not found then raise exception 'Not enough inventory for this sale'; end if;
  end if;
  return new;
end;
$$;

create trigger reduce_inventory_after_sale
after insert on public.order_items for each row execute procedure public.reduce_inventory_on_order_item();

create or replace view public.order_financials as
select
  o.id,
  o.total_price as revenue,
  o.estimated_cost as cost,
  o.total_price - o.estimated_cost as gross_profit,
  coalesce(sum(p.amount), 0) as amount_paid,
  o.total_price - coalesce(sum(p.amount), 0) as balance_owed
from public.orders o
left join public.payments p on p.order_id = o.id
group by o.id;

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.measurements enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "authenticated read profiles" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (id = auth.uid());

do $$
declare table_name text;
begin
  foreach table_name in array array['customers','measurements','suppliers','inventory','orders','order_items','expenses','payments']
  loop
    execute format('create policy "authenticated read %1$s" on public.%1$I for select to authenticated using (true)', table_name);
    execute format('create policy "authenticated insert %1$s" on public.%1$I for insert to authenticated with check (true)', table_name);
    execute format('create policy "authenticated update %1$s" on public.%1$I for update to authenticated using (true)', table_name);
    execute format('create policy "admin delete %1$s" on public.%1$I for delete to authenticated using (public.is_admin())', table_name);
  end loop;
end $$;

create index customers_phone_idx on public.customers(phone);
create index orders_customer_idx on public.orders(customer_id);
create index orders_created_at_idx on public.orders(created_at);
create index expenses_date_idx on public.expenses(expense_date);
create index payments_order_idx on public.payments(order_id);
