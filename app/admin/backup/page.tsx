"use client";

import { Boxes, ClipboardList, Contact, Download, FileJson, MapPinned, ReceiptText, ShieldCheck } from "lucide-react";
import { useData } from "@/components/data-provider";
import { PageHeader } from "@/components/ui";
import { exportBuyingTrips, exportCustomers, exportExpenses, exportFullBackup, exportInventory, exportOrders } from "@/lib/data-export";

export default function BackupPage() {
  const { data } = useData();
  const exports = [
    { label: "Customers CSV", detail: `${data.customers.length} customers and measurements`, icon: Contact, action: () => exportCustomers(data) },
    { label: "Orders & payments CSV", detail: `${data.orders.length} orders with balances and payment history`, icon: ClipboardList, action: () => exportOrders(data) },
    { label: "Inventory CSV", detail: `${data.inventory.length} products and stock quantities`, icon: Boxes, action: () => exportInventory(data) },
    { label: "Expenses CSV", detail: `${data.expenses.length} expense records`, icon: ReceiptText, action: () => exportExpenses(data) },
    { label: "Buying trips CSV", detail: `${data.batches.length} trips and post batches`, icon: MapPinned, action: () => exportBuyingTrips(data) },
  ];

  return (
    <div>
      <PageHeader title="Backup & Export" subtitle="Keep an offline copy of RoseDen business records." />
      <div className="mb-6 flex gap-3 rounded-2xl border border-gold/25 bg-gold/10 p-4 text-sm text-wine">
        <ShieldCheck className="shrink-0 text-gold" size={22} />
        <p className="leading-6">Download backups monthly and before major data cleanup. Store them privately because they contain customer and financial information.</p>
      </div>

      <div className="space-y-3">
        {exports.map((item) => (
          <button key={item.label} onClick={item.action} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-soft">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-burgundy/10 text-burgundy"><item.icon size={22} /></span>
            <span className="min-w-0 flex-1"><strong className="block text-wine">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-black/45">{item.detail}</span></span>
            <Download className="shrink-0 text-gold" size={20} />
          </button>
        ))}
      </div>

      <button onClick={() => exportFullBackup(data)} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wine px-5 font-semibold text-white shadow-soft">
        <FileJson className="text-gold" size={21} /> Download complete emergency backup
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-black/45">CSV files open in Excel or Google Sheets. The complete JSON file preserves all connected records for technical recovery.</p>
    </div>
  );
}
