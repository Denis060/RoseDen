import { AdminOnly } from "@/components/admin-only";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <AdminOnly>{children}</AdminOnly>;
}

