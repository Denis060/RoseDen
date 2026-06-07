insert into public.suppliers (id, name, location) values
  ('10000000-0000-0000-0000-000000000001', 'RoseDen Original', 'Freetown'),
  ('10000000-0000-0000-0000-000000000002', 'Sani Abacha Street Market', 'Freetown');

insert into public.customers (id, name, phone, address, notes) values
  ('20000000-0000-0000-0000-000000000001', 'Mariama Kamara', '+232 76 234 901', 'Wilberforce, Freetown', 'Prefers WhatsApp'),
  ('20000000-0000-0000-0000-000000000002', 'Hawa Sesay', '+232 79 112 405', 'Lumley, Freetown', 'Regular customer');

insert into public.measurements (customer_id, bust, waist, hips, shoulder, height) values
  ('20000000-0000-0000-0000-000000000001', 36, 29, 41, 15, 65),
  ('20000000-0000-0000-0000-000000000002', 38, 31, 43, 16, 64);

insert into public.inventory (id, product_name, category, cost_price, selling_price, quantity, supplier_id, low_stock_at) values
  ('30000000-0000-0000-0000-000000000001', 'Adire wrap dress', 'dress', 430, 850, 4, '10000000-0000-0000-0000-000000000001', 2),
  ('30000000-0000-0000-0000-000000000002', 'Gold evening bag', 'bag', 180, 350, 1, '10000000-0000-0000-0000-000000000002', 2),
  ('30000000-0000-0000-0000-000000000003', 'Cream linen fabric', 'fabric', 95, 160, 8, '10000000-0000-0000-0000-000000000002', 3);
