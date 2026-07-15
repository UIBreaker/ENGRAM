"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BrainCircuit, PenLine, Zap } from "lucide-react";

const nav = [
  { href: "/",           icon: LayoutDashboard, label: "Dashboard" },
  { href: "/vocabulary", icon: BookOpen,         label: "Từ vựng"  },
  { href: "/flashcard",  icon: BrainCircuit,     label: "Flashcard" },
  { href: "/writing",    icon: PenLine,          label: "Writing"   },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none; } }
      `}</style>
      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 224,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: "linear-gradient(135deg, #7B68EE 0%, #E879A0 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(123,104,238,0.45)",
              flexShrink: 0,
            }}>
              <Zap size={18} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "0.04em", color: "var(--text-1)" }}>
                ENGRAM
              </div>
              <div style={{ fontSize: 10, color: "var(--text-4)", marginTop: 1, letterSpacing: "0.06em" }}>
                English · Memorize
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-4)",
            padding: "4px 10px 8px", textTransform: "uppercase" }}>
            Menu
          </div>
          {nav.map(({ href, icon: Icon, label }) => {
            const active = path === href;
            return (
              <Link key={href} href={href} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: "var(--r-md)",
                fontWeight: 600, fontSize: 13.5,
                transition: "all 0.15s",
                color: active ? "#9B8FF5" : "var(--text-3)",
                background: active ? "rgba(123,104,238,0.12)" : "transparent",
                border: active ? "1px solid rgba(123,104,238,0.2)" : "1px solid transparent",
                textDecoration: "none",
                position: "relative",
              }}>
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 20, borderRadius: "0 3px 3px 0",
                    background: "var(--brand)",
                  }} />
                )}
                <Icon size={17} strokeWidth={active ? 2.5 : 2}
                  color={active ? "#7B68EE" : "var(--text-3)"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "12px 12px 20px" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(123,104,238,0.1) 0%, rgba(232,121,160,0.07) 100%)",
            border: "1px solid rgba(123,104,238,0.18)",
            borderRadius: "var(--r-md)", padding: "12px 14px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9B8FF5", marginBottom: 4 }}>
              💡 Mẹo học tập
            </div>
            <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
              15 phút mỗi ngày &gt; 2 tiếng một lần. Tính nhất quán là chìa khoá.
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
