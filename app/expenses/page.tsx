"use client";

import { FormEvent } from "react";
import { Bus, ReceiptText, Trash2 } from "lucide-react";
import { useData } from "@/components/data-provider";
import { IconBox } from "@/components/icons";
import { Field, Form, Modal, PageHeader, Select, useModal } from "@/components/ui";
import { money, shortDate } from "@/lib/format";

const categories = ["transport", "inventory purchase", "rent", "electricity", "internet", "tailoring labor", "marketing", "food", "other"];

export default function ExpensesPage() {
  const { data, addExpense, remove } = useData();
  const modal = useModal();
  const month = new Date().toISOString().slice(0, 7);
  const total = data.expenses.filter((e) => e.date.startsWith(month)).reduce((sum, e) => sum + e.amount, 0);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    addExpense({ date: String(f.get("date")), category: String(f.get("category")), amount: Number(f.get("amount")), notes: String(f.get("notes")) });
    modal.hide();
  }

  return (
    <div>
      <PageHeader title="Expenses" subtitle={`${money(total)} spent this month`} action={modal.show} />
      <div className="space-y-3">{data.expenses.map((expense) => <article key={expense.id} className="flex items-center gap-3 rounded-2xl bg-white p-4"><IconBox icon={expense.category === "transport" ? Bus : ReceiptText} /><div className="min-w-0 flex-1"><h2 className="capitalize font-semibold">{expense.category}</h2><p className="truncate text-xs text-black/45">{shortDate(expense.date)} • {expense.notes || "No notes"}</p></div><p className="font-bold text-wine">{money(expense.amount)}</p><button onClick={() => remove("expenses", expense.id)} className="text-black/25"><Trash2 size={16} /></button></article>)}</div>
      {modal.open && <Modal title="Record expense" onClose={modal.hide}><Form onSubmit={submit} submitLabel="Save expense"><Field name="date" label="Date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /><Select name="category" label="Category">{categories.map((c) => <option key={c}>{c}</option>)}</Select><Field name="amount" label="Amount (NLe)" type="number" step="0.01" required /><Field name="notes" label="Notes" /></Form></Modal>}
    </div>
  );
}
