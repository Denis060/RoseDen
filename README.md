# RoseDen OS

Mobile-first business operations MVP for **RoseDen Atelier**.

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

Without environment variables, the app stores changes in the browser's `localStorage`. This is useful for evaluating the MVP immediately.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL Editor and run `supabase/migrations/001_initial_schema.sql`.
3. Run `supabase/migrations/002_multichannel_commerce.sql`.
4. Run `supabase/migrations/003_business_memory.sql`.
5. Run `supabase/migrations/004_auth_admin_upgrade.sql`.
6. Run `supabase/migrations/005_fix_inventory_status_enum_casts.sql`.
7. Optionally run `supabase/seed.sql`.
8. In Authentication, create Rosannah's user.
9. If using an email other than `joinriseafrica@gmail.com`, set its profile to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');
   ```

10. Add the project URL and anon key to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   ```

The database includes profiles, customers, measurements, suppliers, inventory, orders, order items, expenses, payments, post batches, content, content channels, and leads. Order-item triggers safely reduce stock and mark products reserved or paid. Staff can read and create operational records; destructive deletes are admin-only.

## Vercel

Import the repository into Vercel, set the two Supabase environment variables, and deploy. The project uses the standard Next.js build command.

## MVP note

The current UI data provider uses local persistence for a frictionless demo. The Supabase schema, browser client, authentication screen, and security policies are included. The next production step is replacing the provider's local mutations with Supabase queries while preserving its existing interface.

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
