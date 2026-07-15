"use client";
import { useEffect } from "react";
import { seedSampleData } from "@/lib/db";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedSampleData(); // fire-and-forget: seeds DB if empty
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      <Sidebar />
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }} className="md-main">
        <div className="pb-nav md-pb-0">{children}</div>
      </main>
      <BottomNav />
      <style>{`
        @media (min-width: 768px) {
          .md-main  { margin-left: 224px; }
          .md-pb-0  { padding-bottom: 0 !important; }
        }
      `}</style>
    </div>
  );
}
