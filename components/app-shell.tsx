"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ClipboardList, Contact, LayoutDashboard, ReceiptText } from "lucide-react";
import { ReactNode } from "react";
import { useData } from "./data-provider";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Contact },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { mode, userEmail, signOut, connectionError } = useData();
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-cream text-ink">
      <header className="sticky top-0 z-30 border-b border-burgundy/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link href="/" className="leading-none"><span className="font-display text-xl font-bold text-burgundy">RoseDen Atelier</span><span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-gold">Tailored • Curated • Original</span></Link>
          <div className="flex items-center gap-2">
            <Link href="/reports" className="rounded-full border border-burgundy/15 bg-white px-3 py-2 text-xs font-semibold text-burgundy">Reports</Link>
            {userEmail ? <button onClick={signOut} className="rounded-full bg-burgundy px-3 py-2 text-xs font-semibold text-white">Sign out</button> : <Link href="/login" className="rounded-full bg-burgundy px-3 py-2 text-xs font-semibold text-white">{mode === "demo" ? "Sign in" : "Account"}</Link>}
          </div>
        </div>
      </header>
      {connectionError && <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">{connectionError}</div>}
      <main className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-burgundy/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid w-full max-w-xl grid-cols-5">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`flex min-w-0 min-h-16 flex-col items-center justify-center gap-1 text-[9px] font-semibold sm:text-[10px] ${active ? "text-burgundy" : "text-black/45"}`}><item.icon size={21} strokeWidth={active ? 2.4 : 1.8} /><span className="max-w-full truncate">{item.label}</span></Link>;
          })}
        </div>
      </nav>
    </div>
  );
}
