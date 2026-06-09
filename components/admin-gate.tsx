"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/components/data-provider";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { loading, roleLoading, userEmail, userRole } = useData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !userEmail) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, userEmail]);

  if (loading || roleLoading || !userEmail) {
    return <main className="grid min-h-screen place-items-center bg-cream px-6 text-center"><div><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-burgundy/15 border-t-burgundy" /><p className="mt-4 text-sm font-semibold text-wine">{loading || roleLoading ? "Opening RoseDen OS..." : "Redirecting to secure sign in..."}</p></div></main>;
  }

  if (!userRole) {
    return <main className="grid min-h-screen place-items-center bg-cream px-6 text-center"><div className="max-w-sm rounded-2xl bg-white p-6 shadow-soft"><h1 className="font-display text-2xl font-semibold text-wine">Account setup incomplete</h1><p className="mt-2 text-sm text-black/55">Ask an administrator to check this account in Staff & Access.</p></div></main>;
  }

  return children;
}
