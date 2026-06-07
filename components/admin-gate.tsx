"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useData } from "@/components/data-provider";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { loading, userEmail } = useData();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !userEmail) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, pathname, router, userEmail]);

  if (loading || !userEmail) {
    return <main className="grid min-h-screen place-items-center bg-cream px-6 text-center"><div><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-burgundy/15 border-t-burgundy" /><p className="mt-4 text-sm font-semibold text-wine">{loading ? "Opening RoseDen OS..." : "Redirecting to secure sign in..."}</p></div></main>;
  }

  return children;
}
