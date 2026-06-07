import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { DataProvider } from "@/components/data-provider";

export const metadata: Metadata = { title: "RoseDen OS", description: "The daily operating system for RoseDen Atelier." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#681A2D" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="font-sans"><DataProvider><AppShell>{children}</AppShell></DataProvider></body></html>;
}
