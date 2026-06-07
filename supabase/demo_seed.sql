-- RoseDen OS demo dataset.
-- Safe to rerun: it removes only records with the reserved demo UUIDs below.
-- Run migrations 001-004 before this file.

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

insert into public.suppliers (id, name, phone, location, notes) values
  ('10000000-0000-0000-0000-000000000001', 'RoseDen Original', '+232 76 555 0101', 'Freetown', 'In-house redesigned and tailored pieces'),
  ('10000000-0000-0000-0000-000000000002', 'Sani Abacha Street Market', '+232 77 555 0202', 'Freetown', 'Bags, dresses and accessories'),
  ('10000000-0000-0000-0000-000000000003', 'Conakry Fashion Source', '+224 620 555 303', 'Conakry', 'Shoes and occasion wear');

insert into public.post_batches (id, batch_name, source, purchase_date, total_cost, transport_cost, channels, notes) values
  ('90000000-0000-0000-0000-000000000001', 'Freetown Weekend Stock', 'Freetown', current_date - 12, 5250, 350, array['WhatsApp Status','Facebook','Instagram'], 'Dresses, bags and accessories for weekend posting'),
  ('90000000-0000-0000-0000-000000000002', 'Conakry Occasion Edit', 'Conakry', current_date - 7, 4480, 620, array['WhatsApp Status','TikTok','Instagram'], 'Shoes and occasion pieces');

insert into public.customers (id, name, phone, address, notes) values
  ('20000000-0000-0000-0000-000000000001', 'Mariama Kamara', '+232 76 234 901', 'Wilberforce, Freetown', 'Prefers WhatsApp. Regular tailoring customer.'),
  ('20000000-0000-0000-0000-000000000002', 'Hawa Sesay', '+232 79 112 405', 'Lumley, Freetown', 'Repeat ready-made customer.'),
  ('20000000-0000-0000-0000-000000000003', 'Aminata Bangura', '+232 77 805 221', 'Hill Station, Freetown', 'Likes RoseDen Originals.'),
  ('20000000-0000-0000-0000-000000000004', 'Fatmata Koroma', '+232 78 440 118', 'Juba, Freetown', 'Usually requests delivery.'),
  ('20000000-0000-0000-0000-000000000005', 'Isata Conteh', '+232 75 318 620', 'Congo Cross, Freetown', 'Found RoseDen on TikTok.'),
  ('20000000-0000-0000-0000-000000000006', 'Kadiatu Turay', '+232 74 502 990', 'Aberdeen, Freetown', 'Referred by Mariama.');

insert into public.measurements (customer_id, bust, waist, hips, shoulder, height) values
  ('20000000-0000-0000-0000-000000000001', 36, 29, 41, 15, 65),
  ('20000000-0000-0000-0000-000000000002', 38, 31, 43, 16, 64),
  ('20000000-0000-0000-0000-000000000003', 34, 27, 38, 14, 63),
  ('20000000-0000-0000-0000-000000000004', 40, 34, 45, 16, 66),
  ('20000000-0000-0000-0000-000000000005', 35, 28, 40, 15, 64),
  ('20000000-0000-0000-0000-000000000006', 37, 30, 42, 15, 65);

insert into public.inventory (
  id, product_name, category, cost_price, selling_price, quantity,
  supplier_id, supplier_source, low_stock_at, status, size, color,
  supplier_photo_url, shop_photo_url, try_on_url, batch_id, sku
) values
  ('30000000-0000-0000-0000-000000000001', 'Adire wrap dress', 'dress', 430, 850, 7, '10000000-0000-0000-0000-000000000001', 'RoseDen Original', 2, 'available', 'M-L', 'Blue / cream', null, null, null, '90000000-0000-0000-0000-000000000001', 'RD-DR-001'),
  ('30000000-0000-0000-0000-000000000002', 'Gold evening bag', 'bag', 180, 350, 5, '10000000-0000-0000-0000-000000000002', 'Sani Abacha Street Market', 2, 'available', 'One size', 'Gold', null, null, null, '90000000-0000-0000-0000-000000000001', 'RD-BG-001'),
  ('30000000-0000-0000-0000-000000000003', 'Burgundy block heels', 'shoes', 320, 600, 5, '10000000-0000-0000-0000-000000000003', 'Conakry Fashion Source', 2, 'available', '39', 'Burgundy', null, null, null, '90000000-0000-0000-0000-000000000002', 'RD-SH-001'),
  ('30000000-0000-0000-0000-000000000004', 'Cream linen two-piece', 'top', 390, 780, 4, '10000000-0000-0000-0000-000000000001', 'RoseDen Original', 1, 'available', 'M', 'Cream', null, null, null, '90000000-0000-0000-0000-000000000001', 'RD-ST-001'),
  ('30000000-0000-0000-0000-000000000005', 'Black occasion dress', 'dress', 520, 980, 4, '10000000-0000-0000-0000-000000000003', 'Conakry Fashion Source', 1, 'available', 'L', 'Black / gold', null, null, null, '90000000-0000-0000-0000-000000000002', 'RD-DR-002'),
  ('30000000-0000-0000-0000-000000000006', 'Pearl drop earrings', 'accessory', 45, 120, 10, '10000000-0000-0000-0000-000000000002', 'Sani Abacha Street Market', 3, 'available', 'One size', 'Pearl / gold', null, null, null, '90000000-0000-0000-0000-000000000001', 'RD-AC-001'),
  ('30000000-0000-0000-0000-000000000007', 'RoseDen redesigned denim skirt', 'skirt', 210, 520, 3, '10000000-0000-0000-0000-000000000001', 'RoseDen Original', 1, 'available', 'M', 'Indigo', null, null, null, null, 'RD-OR-001'),
  ('30000000-0000-0000-0000-000000000008', 'Emerald mini handbag', 'bag', 170, 340, 3, '10000000-0000-0000-0000-000000000002', 'Sani Abacha Street Market', 1, 'available', 'One size', 'Emerald', null, null, null, '90000000-0000-0000-0000-000000000001', 'RD-BG-002');

insert into public.inventory_stock_entries (id, inventory_id, quantity, unit_cost, supplier_source, batch_id, notes, stocked_at) values
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 7, 430, 'RoseDen Original', '90000000-0000-0000-0000-000000000001', 'Demo opening stock', current_timestamp - interval '12 days'),
  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 5, 180, 'Sani Abacha Street Market', '90000000-0000-0000-0000-000000000001', 'Demo opening stock', current_timestamp - interval '12 days'),
  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 5, 320, 'Conakry Fashion Source', '90000000-0000-0000-0000-000000000002', 'Demo opening stock', current_timestamp - interval '7 days'),
  ('80000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 4, 390, 'RoseDen Original', '90000000-0000-0000-0000-000000000001', 'Demo opening stock', current_timestamp - interval '12 days'),
  ('80000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 4, 520, 'Conakry Fashion Source', '90000000-0000-0000-0000-000000000002', 'Demo opening stock', current_timestamp - interval '7 days'),
  ('80000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 10, 45, 'Sani Abacha Street Market', '90000000-0000-0000-0000-000000000001', 'Demo opening stock', current_timestamp - interval '12 days'),
  ('80000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000007', 3, 210, 'RoseDen Original', null, 'Demo opening stock', current_timestamp - interval '5 days'),
  ('80000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000008', 3, 170, 'Sani Abacha Street Market', '90000000-0000-0000-0000-000000000001', 'Demo opening stock', current_timestamp - interval '12 days');

insert into public.orders (
  id, customer_id, order_type, item_description, total_price, estimated_cost,
  due_date, status, notes, acquisition_channel, color, size, delivery_plan, created_at
) values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'tailoring', 'Wedding guest fitted dress', 1450, 520, current_date + 5, 'in progress', 'Final fitting on Thursday', 'Referral', 'Burgundy', 'Custom', 'pickup', date_trunc('month', current_timestamp) + interval '1 day'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'ready-made', 'Adire wrap dress', 850, 430, current_date - 2, 'delivered', 'Delivered in Lumley', 'WhatsApp Status', 'Blue / cream', 'M-L', 'delivery', date_trunc('month', current_timestamp) + interval '2 days'),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'original', 'RoseDen redesigned denim skirt', 520, 210, current_date - 1, 'delivered', 'Customer posted a testimonial', 'Instagram', 'Indigo', 'M', 'pickup', date_trunc('month', current_timestamp) + interval '2 days 4 hours'),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'ready-made', 'Gold evening bag', 350, 180, current_date + 1, 'ready', 'Send pickup reminder', 'Facebook', 'Gold', 'One size', 'pickup', date_trunc('month', current_timestamp) + interval '3 days'),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'ready-made', 'Burgundy block heels', 600, 320, current_date + 2, 'pending', 'Waiting for remaining payment', 'TikTok', 'Burgundy', '39', 'delivery', date_trunc('month', current_timestamp) + interval '3 days 5 hours'),
  ('40000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 'ready-made', 'Pearl drop earrings', 240, 90, current_date - 1, 'delivered', 'Two pairs', 'WhatsApp Status', 'Pearl / gold', 'One size', 'delivery', date_trunc('month', current_timestamp) + interval '4 days'),
  ('40000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000001', 'ready-made', 'Cream linen two-piece', 780, 390, current_date + 3, 'ready', 'Pickup after work', 'WhatsApp Status', 'Cream', 'M', 'pickup', date_trunc('month', current_timestamp) + interval '4 days 3 hours'),
  ('40000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', 'ready-made', 'Black occasion dress', 980, 520, current_date + 4, 'in progress', 'Minor waist adjustment', 'Referral', 'Black / gold', 'L', 'pickup', date_trunc('month', current_timestamp) + interval '5 days'),
  ('40000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', 'ready-made', 'Emerald mini handbag', 340, 170, current_date - 1, 'delivered', 'Delivered with dress order', 'Facebook', 'Emerald', 'One size', 'delivery', date_trunc('month', current_timestamp) + interval '5 days 2 hours'),
  ('40000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000003', 'ready-made', 'Adire wrap dress', 850, 430, current_date + 3, 'pending', 'Reserved from status', 'WhatsApp Status', 'Blue / cream', 'M-L', 'pickup', date_trunc('month', current_timestamp) + interval '6 days');

insert into public.order_items (id, order_id, inventory_id, description, quantity, unit_price, unit_cost) values
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Adire wrap dress', 1, 850, 430),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000007', 'RoseDen redesigned denim skirt', 1, 520, 210),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'Gold evening bag', 1, 350, 180),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 'Burgundy block heels', 1, 600, 320),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000006', 'Pearl drop earrings', 2, 120, 45),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000004', 'Cream linen two-piece', 1, 780, 390),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000005', 'Black occasion dress', 1, 980, 520),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000008', 'Emerald mini handbag', 1, 340, 170),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', 'Adire wrap dress', 1, 850, 430);

insert into public.payments (id, order_id, amount, payment_method, paid_at, notes) values
  ('60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 900, 'cash', current_timestamp - interval '4 days', 'Tailoring deposit'),
  ('60000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 850, 'mobile money', current_timestamp - interval '3 days', 'Paid in full'),
  ('60000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 520, 'cash', current_timestamp - interval '3 days', 'Paid in full'),
  ('60000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000004', 200, 'mobile money', current_timestamp - interval '2 days', 'Reservation deposit'),
  ('60000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000005', 300, 'mobile money', current_timestamp - interval '2 days', 'Half payment'),
  ('60000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000006', 240, 'cash', current_timestamp - interval '1 day', 'Paid in full'),
  ('60000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000007', 780, 'mobile money', current_timestamp - interval '1 day', 'Paid in full'),
  ('60000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000008', 500, 'cash', current_timestamp - interval '1 day', 'Deposit'),
  ('60000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000009', 340, 'mobile money', current_timestamp, 'Paid in full'),
  ('60000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000010', 300, 'mobile money', current_timestamp, 'Status reservation');

insert into public.expenses (id, expense_date, category, amount, notes) values
  ('70000000-0000-0000-0000-000000000001', current_date - 6, 'transport', 350, 'Freetown stock buying trip'),
  ('70000000-0000-0000-0000-000000000002', current_date - 5, 'marketing', 180, 'Boosted Facebook product post'),
  ('70000000-0000-0000-0000-000000000003', current_date - 4, 'internet', 220, 'Monthly data bundle'),
  ('70000000-0000-0000-0000-000000000004', current_date - 3, 'tailoring labor', 480, 'Finishing and alteration labor'),
  ('70000000-0000-0000-0000-000000000005', current_date - 2, 'electricity', 160, 'Shop electricity contribution'),
  ('70000000-0000-0000-0000-000000000006', current_date - 1, 'transport', 120, 'Customer deliveries');

commit;
