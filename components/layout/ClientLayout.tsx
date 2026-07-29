"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { seedSampleData } from "@/lib/db";
import { ThemeProvider } from "@/lib/theme";
import { pageVariants } from "@/lib/animations";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import QuickAddButton from "./QuickAddButton";

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ flex: 1, display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}

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
          <div className="pb-nav md-pb-0" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <BottomNav />
        <QuickAddButton />
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
