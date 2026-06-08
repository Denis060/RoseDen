# RoseDen Atelier

Public fashion storefront and private mobile-first business operations system for
**RoseDen Atelier**.

## Routes

- Public website: `/`, `/shop`, `/originals`, `/tailoring`, `/about`, `/contact`
- Private operations: `/admin`, `/admin/orders`, `/admin/customers`,
  `/admin/inventory`, `/admin/expenses`, `/admin/reports`
- Authentication: `/login`

Visitors can browse the public website without signing in. All business records
and operational tools live under `/admin` and require Supabase authentication.

## What works

- Dashboard sales, expenses, profit, pending-order, and stock calculations
- Customer CRM with measurements and purchase totals
- Tailoring, ready-made, and RoseDen Original orders
- Automatic local inventory reduction when an inventory item is sold
- Fast status/social order flow that creates or matches customers by phone
- Smart customer lookup by name or phone with purchase and balance context
- Smart product lookup that fills description, price, cost, color, and size
- Reusable products with transactional restocking instead of duplicate product records
- Stock-entry history for each product, supplier, cost, batch, and buying date
- Customer acquisition tracking for WhatsApp Status, Facebook, TikTok, Instagram, referrals, walk-ins, existing customers, and website
- Product reservation lifecycle: available, reserved, paid, delivered, cancelled
- Photo-first inventory with supplier/model, actual shop, and Rosannah try-on media links
- Buying/post batches with source, stock cost, transport, channels, orders, sold units, and estimated profit
- Inventory quantity controls and low-stock warnings
- Expense tracking
- Sales, profit, top-customer, best-product, and outstanding-balance reports
- Supabase Auth login screen and PostgreSQL schema with roles/RLS
- Local demo mode with sample data when Supabase is not configured

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local`.
4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

Without Supabase environment variables, the admin area uses local demo data for
development. With Supabase configured, signed-out visitors never receive
operational data.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. Run `supabase/migrations/002_multichannel_commerce.sql`.
4. Run `supabase/migrations/003_business_memory.sql`.
5. Run `supabase/migrations/004_auth_admin_upgrade.sql`.
6. Run `supabase/migrations/005_fix_inventory_status_enum_casts.sql`.
7. Run `supabase/migrations/006_phase1_daily_operations.sql`, or use the
   split scripts in `supabase/phase1_steps` if required.
8. Run `supabase/migrations/007_public_storefront.sql`.
9. Optionally run `supabase/seed.sql`.
10. In Authentication, create Rosannah's user.
11. If using an email other than `joinriseafrica@gmail.com`, set its profile to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');
   ```

12. Add the project URL, anon key, and WhatsApp number to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   NEXT_PUBLIC_WHATSAPP_NUMBER=232XXXXXXXX
   ```

Migration `007` adds public product publishing fields while restricting anonymous
visitors to storefront-safe columns. Product costs, suppliers, customers, orders,
payments, and expenses remain private.

## Vercel

Import the repository into Vercel, set the three environment variables shown
above, and deploy. The project uses the standard Next.js build command.

## Product model

RoseDen OS treats customers and products as reusable parent records:

- A customer has many orders, payments, measurements, inquiries, and purchases.
- A product has many stock entries, orders, content posts, reservations, and sales.
- Restocking adds a stock-entry child record and updates available quantity; it does not create a duplicate product.
- Selecting an existing customer or product reuses its saved information and history.

## Marketing roadmap

The v1.5 UI records sales attribution and post batches. The v2 database foundation also supports:

- Product content and captions
- Publishing the same content across multiple channels
- Inquiry and lead tracking
- Lead-to-reservation and lead-to-sale conversion
- Revenue and conversion rates by content and channel
- Reviews, testimonials, and repeat-purchase follow-up

## Demo data

To preview the complete system with realistic customers, products, orders, payments, batches, channels, and expenses:

1. Run `supabase/demo_seed.sql` in Supabase SQL Editor.
2. Sign in to RoseDen OS and refresh the page.
3. When ready for real data, run `supabase/clear_demo_data.sql`.

The clear script removes only records using RoseDen's reserved demo UUIDs. It does not delete real records entered through the app.
## Phase 1 database update

If the project was already set up before Phase 1, run only this new file in the
Supabase SQL Editor:

`supabase/migrations/006_phase1_daily_operations.sql`

Do not rerun or edit migrations `001` through `005`. Migration `006` adds:

- correct available, reserved, sold, and total quantity calculations
- safe stock changes when an order is edited or cancelled
- the public `product-images` Storage bucket and authenticated upload policies
- the inventory quantity summary used by product detail pages

If the Supabase SQL Editor reports an unterminated dollar-quoted string, use
the four smaller scripts in `supabase/phase1_steps` instead. Run them in
number order, then run `supabase/verify_phase1.sql`.

## Phase 2 database update

Run `supabase/migrations/008_phase2_buying_trips.sql` after migration `007`.
It links expenses to buying trips and adds trip status/allocation settings. The
admin buying-trip detail page then calculates landed cost, markup, margin,
expected profit, and actual delivered-sales profit.
