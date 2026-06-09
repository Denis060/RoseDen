"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useData } from "@/components/data-provider";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { roleLoading, isAdmin } = useData();

  if (roleLoading) {
    return <div className="py-16 text-center text-sm text-black/50">Checking administrator access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <ShieldAlert className="mx-auto text-amber-700" size={30} />
        <h1 className="mt-3 font-display text-2xl font-semibold text-wine">Admin access required</h1>
        <p className="mt-2 text-sm text-black/55">This section contains sensitive business settings and is available only to administrators.</p>
        <Link href="/admin" className="mt-5 inline-flex h-11 items-center rounded-xl bg-burgundy px-5 text-sm font-semibold text-white">Back to dashboard</Link>
      </div>
    );
  }

  return children;
}

