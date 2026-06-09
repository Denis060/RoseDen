import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-center">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-soft">
        <SearchX className="mx-auto text-gold" size={38} />
        <h1 className="mt-4 font-display text-3xl font-semibold text-wine">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-black/50">This link may be old or the record may no longer exist.</p>
        <Link href="/" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-burgundy font-semibold text-white"><ArrowLeft size={18} />Return home</Link>
      </div>
    </main>
  );
}

