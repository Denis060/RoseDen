import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";

export const metadata = {
  title: "Offline",
  description: "RoseDen Atelier offline connection page.",
};

export default function OfflinePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 text-center">
      <div className="max-w-sm rounded-3xl bg-white p-7 shadow-soft">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-burgundy"><WifiOff size={26} /></span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-wine">The connection is resting.</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">Previously opened RoseDen pages may still work. Unfinished admin forms remain saved on this phone until the internet returns.</p>
        <Link href="/" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-burgundy font-semibold text-white"><RefreshCw size={17} />Try RoseDen again</Link>
      </div>
    </main>
  );
}
