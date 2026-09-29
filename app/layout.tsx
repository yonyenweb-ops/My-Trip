import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { BottomNav } from "@/components/BottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { SideNav } from "@/components/SideNav";
import { Toaster } from "@/components/Toaster";
import { THEME_COLORS, THEME_SCRIPT } from "@/lib/theme-script";
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
  // Updated to the dark color by THEME_SCRIPT when dark mode is on.
  themeColor: THEME_COLORS.light,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by THEME_SCRIPT before paint, so the server and client markup differ on purpose.
    <html lang="en" className={geistSans.variable} data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh font-sans">
        {/* Covers the iPhone status bar area so page content doesn't scroll behind the clock. */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[env(safe-area-inset-top)] bg-app" aria-hidden />
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
