import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "RoseDen Atelier", template: "%s | RoseDen Atelier" },
  description: "Tailored, curated, and original fashion from Makeni, Sierra Leone.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#681A2D" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="font-sans">{children}</body></html>;
}
