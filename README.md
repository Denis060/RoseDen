# RoseDen Atelier

Public fashion storefront and private mobile-first business operations system for
**RoseDen Atelier**.

## Routes

- Public website: `/`, `/shop`, `/originals`, `/tailoring`, `/about`, `/contact`
- Private operations: `/admin`, `/admin/orders`, `/admin/customers`,
  `/admin/inventory`, `/admin/expenses`, `/admin/reports`, `/admin/activity`
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
- Printable and WhatsApp-ready customer receipts
- Admin-only audit history for orders, payments, stock, customers, expenses,
  buying trips, and website changes
- Admin and Staff roles with database-enforced permissions
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
9. Run `supabase/migrations/008_phase2_buying_trips.sql`.
10. Run `supabase/migrations/009_website_content_management.sql`.
11. Run `supabase/migrations/010_receipts_and_audit_history.sql`.
12. Run `supabase/migrations/011_staff_roles_and_permissions.sql`.
13. Run migrations `012` through `016` in number order.
14. Optionally run `supabase/seed.sql`.
15. In Authentication, create Rosannah's user.
16. If using an email other than `joinriseafrica@gmail.com`, set its profile to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_EMAIL');
   ```

17. Add the project URL, anon key, and WhatsApp number to `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
   SUPABASE_SECRET_KEY=YOUR_SB_SECRET_KEY
   NEXT_PUBLIC_WHATSAPP_NUMBER=232XXXXXXXX
   ```

   `SUPABASE_SECRET_KEY` is server-only. Find the `sb_secret_...` key in
   Supabase under **Project Settings -> API Keys**, add it to `.env.local`
   and Vercel, and never prefix it with `NEXT_PUBLIC_` or place it in
   client-side code. The legacy `SUPABASE_SERVICE_ROLE_KEY` is also supported.

Migration `007` adds public product publishing fields while restricting anonymous
visitors to storefront-safe columns. Product costs, suppliers, customers, orders,
payments, and expenses remain private.

## Vercel

Import the repository into Vercel, set the four environment variables shown
above, and deploy. The project uses the standard Next.js build command.

Once the service role key is configured, an administrator can create staff
logins directly from **Admin -> Staff & Access -> Add staff member**. Rosannah
does not need to open the Supabase dashboard.

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

## Website content management

Migration `009` adds the simple mobile Website editor at `/admin/website`.
Rosannah can change the homepage words, public photos, About and Tailoring
introductions, services, customer reviews, contact details, social links, and
WhatsApp number without editing code.

Each inventory product can also hold up to three public photos. Open a product
in Admin Inventory, tap Edit, add its photos, then choose **Show on website**
and optionally **Featured product**.

## Phase 4A receipts and audit history

Run `supabase/migrations/010_receipts_and_audit_history.sql` once in the
Supabase SQL Editor. It is safe to rerun.

- Open any order and tap **View receipt** to print, save as PDF, or send the
  receipt summary through WhatsApp.
- Open **Activity History** from the dashboard to review changes. Audit history
  is visible only to administrators.

## Phase 4B staff access

Run `supabase/migrations/011_staff_roles_and_permissions.sql` once in the
Supabase SQL Editor. It is safe to rerun.

If the SQL Editor reports an unterminated dollar-quoted string, run the five
smaller files in `supabase/phase4b_steps` in number order, then run
`supabase/verify_phase4b.sql`.

To add staff:

1. Open **Admin -> Staff & Access** in RoseDen OS.
2. Tap **Add staff member**.
3. Enter their name, email, starting password, and access level.

Staff can manage customers, orders, payments, order status, and expenses.
Admins additionally manage inventory, buying trips, reports, website content,
activity history, deletions, and staff roles.

## Phase 4C RoseDen Advisor

The admin-only **RoseDen Advisor** turns existing business records into daily
recommendations. It highlights overdue orders, outstanding balances, proven
products that need restocking, weak margins, high expense ratios, strong sales
channels, and available products hidden from the website.

This first version is private, deterministic, and free: it does not send
customer or financial data to an external AI provider.

## Phase 5 launch readiness

Phase 5 adds:

- in-app temporary password resets and staff login disabling/restoring
- self-service forgot-password email recovery
- admin CSV exports and a complete JSON emergency backup
- stronger photo compression and long-lived image caching for mobile data
- a compact mobile **More** menu instead of overlapping floating shortcuts
- an installable Progressive Web App with an **Install RoseDen OS** action

Before launch, add the production `/update-password` URL to the allowed
Supabase Authentication redirect URLs. Admins should download a backup monthly
and test login, order, payment, inventory, expense, receipt, and website flows
on Rosannah's actual phone.

## Phase 6A product merchandising

Run `supabase/migrations/012_product_merchandising.sql` once. It allows public
visitors to see published products marked available, reserved, or sold while
keeping costs, suppliers, buying trips, and stock history private.

Phase 6A adds:

- one mobile **Add & publish product** workflow with up to three phone photos
- automatic product web codes and an exact customer-card preview
- publish-now or save-private choices
- real published inventory only; sample products no longer appear as stock
- shop search and category, size, color, and availability filters
- clearer product cards with sizes, colors, collection, and status
- an interactive product gallery with size and color selection
- WhatsApp messages containing the customer's selected product options
- reserved and sold product presentation
- a sold archive for one-of-one RoseDen Originals

## Phase 6B assisted selling

Run `supabase/migrations/013_whatsapp_product_inquiries.sql` once.

- Selecting inventory in an order fills its description, type, size, color,
  selling price, cost, and available stock.
- Quantity automatically recalculates the total and estimated cost.
- Payment automatically shows the remaining balance.
- Website WhatsApp product clicks appear under **Admin -> More -> Product
  interest**.
- A product click is stored as an inquiry, not a sale. Staff can convert a
  confirmed inquiry into an order with the product already selected.

Run `supabase/migrations/014_customer_phone_identity.sql` after migration 013.
It makes the final eight phone digits the unique customer identity. New order
customers are saved automatically, existing phone numbers reuse the existing
customer, and duplicate phone records are prevented.

## Phase 6C customer engagement

Run `supabase/migrations/015_customer_engagement.sql` once.

- The Follow-ups workspace groups overdue orders, ready orders, outstanding
  balances, recent deliveries needing reviews, and upcoming birthdays.
- RoseDen prepares editable WhatsApp messages with customer and order details.
- Staff must review the message and approve sending inside WhatsApp.
- Opening WhatsApp records a follow-up entry on the order and customer profile.
- Birthdays are optional and can be added from customer create/edit forms.

## Phase 7 stabilization

Phase 7 separates order revenue from actual payment dates, reports all
outstanding balances, protects destructive actions with confirmation screens,
includes birthdays in customer exports, and adds public Privacy and Terms
pages. Dashboard cash figures now mean payments actually received during the
displayed day or month.

## Phase 8A marketing and content

Run `supabase/migrations/016_marketing_content_workspace.sql` once. It is safe
to rerun.

Open **Admin -> More -> Marketing** after Rosannah posts a product. Choose the
product, content type, date, and channels, then save the caption. Later, tap
**Update results** to record confirmed inquiries, reservations, sales, and
revenue for each channel.

This phase records marketing performance but does not automatically publish to
WhatsApp, Facebook, TikTok, or Instagram. Rosannah remains in control of every
post.

## Phase 8B smart product posting

Product names are optional when adding inventory. Choose a category and color,
then tap **Suggest simple name**, or leave the name blank and RoseDen creates a
clear name automatically.

Every inventory product now has **Prepare post**. RoseDen prepares the product
photo, caption, price, sizes, colors, and website link for the phone share
sheet. After Rosannah finishes posting, **I posted it - record channels** adds
the selected channels to Marketing.

Customers can also open a product and tap **Share this product**. Sharing uses
the phone's supported apps and always requires the person to confirm the final
post or message.
