import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | RoseDen Atelier",
  description: "RoseDen Atelier ordering, payment, tailoring, availability, pickup, and delivery terms.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-gold">Last updated: June 9, 2026</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-wine sm:text-5xl">Terms & Conditions</h1>
      <div className="mt-8 space-y-7 rounded-3xl bg-white p-5 text-sm leading-7 text-black/65 shadow-soft sm:p-8">
        <section><h2 className="font-display text-2xl font-semibold text-wine">Website and WhatsApp orders</h2><p className="mt-2">A website or WhatsApp inquiry does not guarantee reservation. RoseDen confirms availability, size, color, price, payment, and collection or delivery directly with the customer.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Prices and availability</h2><p className="mt-2">Prices are shown in Sierra Leonean leones unless stated otherwise. Fashion stock can sell quickly. An item is reserved only after RoseDen confirms the reservation and any required deposit.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Tailoring</h2><p className="mt-2">Tailoring timelines begin after design, measurements, fabric, price, and deposit are agreed. Customers should attend requested fittings. Major design changes after work begins may affect the price and delivery date.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Payments and balances</h2><p className="mt-2">Deposits and payment schedules are agreed per order. Outstanding balances should be completed before or at delivery unless RoseDen approves another arrangement.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Pickup, delivery, and returns</h2><p className="mt-2">Pickup or delivery arrangements are confirmed per order. Customers should inspect ready-made items promptly. Custom-made, altered, and one-of-one pieces may not be returnable unless there is a confirmed workmanship issue.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Questions</h2><p className="mt-2">Please <Link href="/contact" className="font-semibold text-burgundy underline">contact RoseDen Atelier</Link> before ordering if you need clarification about a product, tailoring service, payment, or delivery.</p></section>
      </div>
    </main>
  );
}

