import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | RoseDen Atelier",
  description: "How RoseDen Atelier handles customer information, measurements, orders, and website inquiries.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-wider text-gold">Last updated: June 9, 2026</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-wine sm:text-5xl">Privacy Policy</h1>
      <div className="mt-8 space-y-7 rounded-3xl bg-white p-5 text-sm leading-7 text-black/65 shadow-soft sm:p-8">
        <section><h2 className="font-display text-2xl font-semibold text-wine">Information we keep</h2><p className="mt-2">RoseDen Atelier may store your name, phone number, location, order history, payments, clothing measurements, preferences, and messages you choose to share with us.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Why we use it</h2><p className="mt-2">We use this information to prepare and deliver orders, manage tailoring fittings, contact you about balances or collection, improve our service, and respond to website or WhatsApp inquiries.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Photos and reviews</h2><p className="mt-2">We will ask for permission before using identifiable customer photos, videos, or testimonials in public marketing.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Keeping information private</h2><p className="mt-2">Business records are available only to authorized RoseDen staff. We do not sell customer information. WhatsApp and social platforms process messages under their own privacy policies.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Your choices</h2><p className="mt-2">You may ask RoseDen to correct your details, stop marketing follow-ups, or delete information that is no longer required for an active order or legal business record.</p></section>
        <section><h2 className="font-display text-2xl font-semibold text-wine">Contact</h2><p className="mt-2">Contact RoseDen through our <Link href="/contact" className="font-semibold text-burgundy underline">contact page</Link> with any privacy question or request.</p></section>
      </div>
    </main>
  );
}

