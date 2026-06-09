import { AdminOnly } from "@/components/admin-only";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}

