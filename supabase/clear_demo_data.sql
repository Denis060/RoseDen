-- Removes only the RoseDen demo dataset. Real records are untouched.

begin;

delete from public.payments where id::text like '60000000-0000-0000-0000-%';
delete from public.order_items where id::text like '50000000-0000-0000-0000-%';
delete from public.orders where id::text like '40000000-0000-0000-0000-%';
delete from public.inventory_stock_entries where id::text like '80000000-0000-0000-0000-%';
delete from public.expenses where id::text like '70000000-0000-0000-0000-%';
delete from public.measurements where customer_id::text like '20000000-0000-0000-0000-%';
delete from public.inventory where id::text like '30000000-0000-0000-0000-%';
delete from public.customers where id::text like '20000000-0000-0000-0000-%';
delete from public.post_batches where id::text like '90000000-0000-0000-0000-%';
delete from public.suppliers where id::text like '10000000-0000-0000-0000-%';

commit;
