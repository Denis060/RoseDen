import { AdminOnly } from "@/components/admin-only";

export default function BackupLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}
