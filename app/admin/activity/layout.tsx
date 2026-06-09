import { AdminOnly } from "@/components/admin-only";

export default function ActivityLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}

