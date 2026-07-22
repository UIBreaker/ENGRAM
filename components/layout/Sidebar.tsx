"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Zap } from "lucide-react";

const nav = [
  { href: "/",           icon: Home,        label: "Dashboard" },
  { href: "/vocabulary", icon: BookOpen,    label: "Từ vựng"   },
  { href: "/flashcard",  icon: BrainCircuit,label: "Ôn tập"    },
  { href: "/practice",   icon: Target,      label: "Luyện tập" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }
        .sidebar-link { transition: all 0.14s; }
        .sidebar-link:hover { background: rgba(255,255,255,0.04) !important; color: var(--text-2) !important; }
      `}</style>
      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "#0A0A18",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", zIndex: 40,
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#7B68EE,#E879A0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(123,104,238,0.45)",
              flexShrink: 0,
            }}>
              <Zap size={17} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.05em", color: "white" }}>ENGRAM</div>
              <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.25)", marginTop: 1, letterSpacing: "0.08em" }}>English · Memorize</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.2)",
            padding: "4px 10px 8px", textTransform: "uppercase" }}>
            Menu
          </div>
          {nav.map(({ href, icon: Icon, label }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className="sidebar-link" style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 12,
                fontWeight: 600, fontSize: 13,
                color: active ? "#9B8FF5" : "rgba(255,255,255,0.38)",
                background: active ? "rgba(123,104,238,0.12)" : "transparent",
                border: active ? "1px solid rgba(123,104,238,0.18)" : "1px solid transparent",
                textDecoration: "none",
                position: "relative",
              }}>
                {active && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, borderRadius: "0 3px 3px 0",
                    background: "#7B68EE",
                  }} />
                )}
                <Icon size={16} strokeWidth={active ? 2.5 : 2}
                  color={active ? "#7B68EE" : "rgba(255,255,255,0.35)"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "10px 12px 20px" }}>
          <div style={{
            background: "linear-gradient(135deg,rgba(123,104,238,0.08),rgba(232,121,160,0.05))",
            border: "1px solid rgba(123,104,238,0.14)",
            borderRadius: 12, padding: "11px 13px",
          }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#9B8FF5", marginBottom: 3 }}>💡 Mẹo</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", lineHeight: 1.5 }}>
              15 phút mỗi ngày hiệu quả hơn 2 tiếng một lần. Hãy kiên trì!
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
