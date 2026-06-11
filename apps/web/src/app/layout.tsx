import "./globals.css";

import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-vietnam",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "DealXin \u2014 S\u0103n Deal Vi\u1EC7t Nam",
    template: "%s | DealXin",
  },
  description:
    "N\u1EC1n t\u1EA3ng t\u1ED5ng h\u1EE3p deal, voucher, flash sale v\u00E0 l\u1ED7i gi\u00E1 t\u1EEB Shopee, Lazada, TikTok Shop. Kh\u00F4ng b\u1ECF l\u1EDD b\u1EA5t k\u1EF3 \u01B0u \u0111\u00E3i n\u00E0o.",
  keywords: [
    "deal",
    "voucher",
    "flash sale",
    "Shopee",
    "Lazada",
    "TikTok Shop",
    "ecommerce Vietnam",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${beVietnam.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
