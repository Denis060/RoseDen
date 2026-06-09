import Link from "next/link";
import { Banknote, Boxes, CheckCircle2, ClipboardList, Contact, HeartHandshake, LifeBuoy, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/ui";

const tasks = [
  { icon: ClipboardList, title: "Record an order", steps: ["Open Orders", "Tap the plus button", "Find or enter the customer", "Choose the product", "Enter payment and save"], href: "/admin/orders?new=1" },
  { icon: Banknote, title: "Add a payment", steps: ["Open Orders", "Open the customer order", "Tap Add payment", "Enter amount and method"], href: "/admin/orders" },
  { icon: Boxes, title: "Add a product", steps: ["Open Inventory", "Tap the plus button", "Add photos and price", "Publish now if customers should see it"], href: "/admin/inventory" },
  { icon: Contact, title: "Save a customer", steps: ["Open Customers", "Tap the plus button", "Enter name and phone", "Measurements and birthday are optional"], href: "/admin/customers" },
  { icon: ReceiptText, title: "Record an expense", steps: ["Open Expenses", "Tap the plus button", "Choose the category", "Enter the amount and notes"], href: "/admin/expenses" },
  { icon: HeartHandshake, title: "Follow up", steps: ["Open Customer Follow-ups", "Choose a reminder", "Review the prepared message", "Open and approve it in WhatsApp"], href: "/admin/follow-ups" },
];

export default function HelpPage() {
  return (
    <div>
      <PageHeader title="How to use RoseDen" subtitle="Simple steps for everyday work" />
      <div className="mb-6 flex gap-3 rounded-2xl border border-gold/25 bg-gold/10 p-4">
        <LifeBuoy className="shrink-0 text-gold" />
        <div><p className="font-bold text-wine">You cannot spoil the system by exploring.</p><p className="mt-1 text-xs leading-5 text-black/55">Important deletions ask for confirmation. Start with the task you need today.</p></div>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => <article key={task.title} className="rounded-2xl bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-burgundy/10 text-burgundy"><task.icon size={20} /></span><h2 className="font-display text-xl font-semibold text-wine">{task.title}</h2></div>
          <ol className="mt-4 space-y-2">{task.steps.map((step, index) => <li key={step} className="flex gap-2 text-sm text-black/60"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-gold" /><span><strong className="text-wine">{index + 1}.</strong> {step}</span></li>)}</ol>
          <Link href={task.href} className="mt-4 flex h-11 items-center justify-center rounded-xl border border-burgundy/15 font-semibold text-burgundy">Open {task.title.toLowerCase()}</Link>
        </article>)}
      </div>
    </div>
  );
}

