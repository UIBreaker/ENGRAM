import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // Only load weights we actually use
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  themeColor: "#07070F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,          // prevent pinch-zoom messing layouts
  viewportFit: "cover",         // extend into notch / Dynamic Island area
};

export const metadata: Metadata = {
  title: "ENGRAM – Học tiếng Anh thông minh",
  description: "Ứng dụng học từ vựng tiếng Anh với Spaced Repetition, Flashcard có ảnh & AI Writing.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // full-screen on iOS home screen
    title: "ENGRAM",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        {/* Preconnect to Supabase for faster first query */}
        <link rel="preconnect" href="https://zpqrvnlbldhbpnakozhy.supabase.co" />
        {/* Preconnect to Unsplash for flashcard images */}
        <link rel="preconnect" href="https://source.unsplash.com" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
