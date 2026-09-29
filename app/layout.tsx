import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { SideNav } from "@/components/SideNav";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trip Money",
  description: "A simple travel wallet: enter your starting money, record every expense, always know what's left.",
  appleWebApp: { capable: true, title: "Trip Money", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1211" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-dvh font-sans">
        <SideNav />
        <div className="md:pl-60">
          <main className="mx-auto w-full max-w-5xl px-4 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:px-8 md:pt-8 md:pb-12">
            <InstallPrompt />
            {children}
          </main>
        </div>
        <BottomNav />
        <Toaster />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
