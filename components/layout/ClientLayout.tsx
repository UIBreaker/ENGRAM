"use client";
import { useEffect } from "react";
import { seedSampleData } from "@/lib/db";
import { ThemeProvider } from "@/lib/theme";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedSampleData();
  }, []);

  return (
    <ThemeProvider>
      <div style={{ display: "flex", minHeight: "100dvh" }}>
        <Sidebar />
        <main
          style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
          className="md-main"
        >
          {/* pb-nav: clears mobile bottom nav bar */}
          <div className="pb-nav md-pb-0" style={{ flex: 1 }}>
            {children}
          </div>
        </main>
        <BottomNav />
        <style>{`
          @media (min-width: 768px) {
            .md-main  { margin-left: 220px; }
            .md-pb-0  { padding-bottom: 0 !important; }
          }
        `}</style>
      </div>
    </ThemeProvider>
  );
}
