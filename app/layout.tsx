import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/store-provider";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sweet Delights | Artisan Bakery & Handcrafted Cakes",
  description: "Handcrafted cakes made with love for your sweetest celebrations. Premium artisan cakes, cheesecakes, cupcakes, and custom designer cakes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col font-sans bg-stone-50/50 text-slate-800`}
      >
        <StoreProvider>
          <AppShell>{children}</AppShell>
          <Toaster richColors position="top-right" />
        </StoreProvider>
      </body>
    </html>
  );
}
