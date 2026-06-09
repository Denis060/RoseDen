"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, Contact, DatabaseBackup, HeartHandshake, LayoutDashboard, LifeBuoy, MapPinned, Menu, MessageCircle, ReceiptText, Settings2, Sparkles, UsersRound, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { useData } from "./data-provider";
import { InstallAppButton } from "./pwa-tools";

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
  const [moreOpen, setMoreOpen] = useState(false);
  const { userEmail, userName, userRole, isAdmin, signOut, connectionError } = useData();

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-cream text-ink">
      <header className="admin-print-hidden sticky top-0 z-30 border-b border-burgundy/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/admin" className="leading-none"><span className="font-display text-xl font-bold text-burgundy">RoseDen Atelier</span><span className="mt-1 block text-[9px] uppercase tracking-[0.22em] text-gold">Tailored · Curated · Original</span></Link>
          {userEmail && <div className="min-w-0 sm:ml-auto sm:text-right">
            <p className="truncate text-xs font-semibold text-wine">{userName || userEmail}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gold">{userRole || "staff"}</p>
          </div>}
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
      {isAdmin && !pathname.endsWith("/receipt") && <>
        <button onClick={() => setMoreOpen(true)} className="fixed bottom-20 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-wine px-4 text-xs font-bold text-white shadow-soft sm:hidden"><Menu size={18} className="text-gold" />More</button>
        {moreOpen && <div className="fixed inset-0 z-50 flex items-end bg-black/45 sm:hidden" onClick={() => setMoreOpen(false)}>
          <div className="max-h-[82vh] w-full overflow-y-auto rounded-t-[28px] bg-cream p-5" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-2xl font-semibold text-wine">More tools</h2><p className="text-xs text-black/45">Admin controls and business insights</p></div><button onClick={() => setMoreOpen(false)} className="grid h-11 w-11 place-items-center rounded-full bg-black/5"><X size={20} /></button></div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["/admin/advisor", "Advisor", Sparkles],
                ["/admin/follow-ups", "Follow-ups", HeartHandshake],
                ["/admin/inquiries", "Product interest", MessageCircle],
                ["/admin/batches", "Buying trips", MapPinned],
                ["/admin/reports", "Reports", BarChart3],
                ["/admin/backup", "Backup", DatabaseBackup],
                ["/admin/help", "How to use", LifeBuoy],
                ["/admin/staff", "Staff", UsersRound],
                ["/admin/website", "Website", Settings2],
              ].map(([href, label, Icon]) => <Link key={href as string} href={href as string} onClick={() => setMoreOpen(false)} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-burgundy shadow-soft"><Icon size={22} className="text-gold" />{label as string}</Link>)}
            </div>
            <div className="mt-4"><InstallAppButton onComplete={() => setMoreOpen(false)} /></div>
          </div>
        </div>}
      </>}
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
