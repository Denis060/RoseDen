import { AdminGate } from "@/components/admin-gate";
import { AppShell } from "@/components/app-shell";
import { DataProvider } from "@/components/data-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DataProvider><AdminGate><AppShell>{children}</AppShell></AdminGate></DataProvider>;
}
