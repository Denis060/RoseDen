import { PublicShell } from "@/components/public-site";
import { WebsiteContentProvider } from "@/components/website-content";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <WebsiteContentProvider><PublicShell>{children}</PublicShell></WebsiteContentProvider>;
}
