import { AdminOnly } from "@/components/admin-only";

export default function AdvisorLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
