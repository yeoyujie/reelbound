import { Analytics } from "@vercel/analytics/next";
import { SiteHeader } from "@/components/site-header";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextFrame — Stories in motion",
  description:
    "A considered collection of original AI-made series, told one episode at a time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
