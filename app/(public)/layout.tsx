import { PublicShell } from "@/components/public-site";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
