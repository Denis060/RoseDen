"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, ClipboardList, Contact, LayoutDashboard, MapPinned, ReceiptText, Settings2, UsersRound } from "lucide-react";
import { ReactNode } from "react";
import { useData } from "./data-provider";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Contact },
  { href: "/admin/expenses", label: "Expenses", icon: ReceiptText },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userEmail, isAdmin, signOut, connectionError } = useData();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-cream text-ink">
      <header className="admin-print-hidden sticky top-0 z-30 border-b border-burgundy/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/admin" className="leading-none"><span className="font-display text-xl font-bold text-burgundy">RoseDen Atelier</span><span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-gold">Tailored · Curated · Original</span></Link>
          <div className={`grid w-full gap-2 sm:flex sm:w-auto sm:items-center ${isAdmin ? "grid-cols-3" : "grid-cols-1"}`}>
            {isAdmin && <Link href="/admin/reports" className="rounded-full border border-burgundy/15 bg-white px-3 py-2 text-center text-xs font-semibold text-burgundy">Reports</Link>}
            {isAdmin && <Link href="/admin/staff" className="hidden rounded-full border border-burgundy/15 bg-white px-3 py-2 text-xs font-semibold text-burgundy sm:block">Staff</Link>}
            {isAdmin && <Link href="/admin/website" className="rounded-full bg-gold px-3 py-2 text-center text-xs font-bold text-burgundy">Edit Website</Link>}
            {userEmail && <button onClick={handleSignOut} className="rounded-full bg-burgundy px-3 py-2 text-xs font-semibold text-white">Sign out</button>}
          </div>
        </div>
      </header>
      {connectionError && <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">{connectionError}</div>}
      <main className="mx-auto w-full min-w-0 max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">{children}</main>
      {isAdmin && !pathname.endsWith("/receipt") && <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end gap-2 sm:hidden">
        <Link href="/admin/staff" className="flex h-12 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-burgundy shadow-soft"><UsersRound size={17} />Staff</Link>
        <Link href="/admin/website" className="flex h-12 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-burgundy shadow-soft"><Settings2 size={17} />Website</Link>
        <Link href="/admin/batches" className="flex h-12 items-center gap-2 rounded-full bg-gold px-4 text-xs font-bold text-burgundy shadow-soft"><MapPinned size={17} />Trips</Link>
      </div>}
      <nav className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-burgundy/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid w-full max-w-xl grid-cols-5">
          {nav.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 text-[9px] font-semibold sm:text-[10px] ${active ? "text-burgundy" : "text-black/45"}`}><item.icon size={21} strokeWidth={active ? 2.4 : 1.8} /><span className="max-w-full truncate">{item.label}</span></Link>;
          })}
        </div>
      </nav>
    </div>
  );
}
