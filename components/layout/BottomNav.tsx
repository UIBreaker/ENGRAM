"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Trophy } from "lucide-react";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/",            icon: Home,         label: "Home",    color: "#FF5964" },
  { href: "/vocabulary",  icon: BookOpen,      label: "Từ vựng", color: "#FFE052" },
  { href: "/flashcard",   icon: BrainCircuit,  label: "Ôn tập",  color: "#9C8EFA" },
  { href: "/practice",    icon: Target,        label: "Luyện",   color: "#4ECCD3" },
  { href: "/leaderboard", icon: Trophy,        label: "Hạng",    color: "#FF70A6" },
];

export default function BottomNav() {
  const path = usePathname();
  const { toggle, isDark, mounted } = useTheme();

  return (
    <>
      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        .bnav-item { -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; }
        .bnav-item:active { transform: translateY(2px); }
      `}</style>

      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--sidebar-bg)",
        borderTop: "2.5px solid var(--border-color)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: 2,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}>

        {nav.map(({ href, icon: Icon, label, color }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className="bnav-item" style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2,
              padding: "6px 2px 9px",
              textDecoration: "none",
              transition: "opacity 0.1s ease",
            }}>
              <div style={{
                padding: "5px 12px",
                borderRadius: 99,
                background: active ? color : "transparent",
                border: `2px solid ${active ? "var(--border-color)" : "transparent"}`,
                boxShadow: active ? "2px 2px 0 var(--border-color)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s ease, border-color 0.2s ease, box-shadow 0.15s ease",
              }}>
                <Icon
                  size={17}
                  color={active ? "#000000" : "var(--text-3)"}
                  strokeWidth={active ? 3 : 2}
                />
              </div>
              <span style={{
                fontSize: 9.5, fontWeight: active ? 900 : 600,
                color: active ? "var(--text-1)" : "var(--text-4)",
                lineHeight: 1, letterSpacing: "0.01em",
                transition: "color 0.15s ease",
              }}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* ─ Theme Toggle ─ */}
        <button onClick={toggle} className="bnav-item" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 2,
          padding: "6px 2px 9px",
          background: "transparent", border: "none", cursor: "pointer",
        }}>
          <div style={{
            padding: "5px 12px", borderRadius: 99,
            background: "transparent", border: "2px solid transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 17, fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji", lineHeight: 1 }}>
              {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
            </span>
          </div>
          <span style={{
            fontSize: 9.5, fontWeight: 600,
            color: "var(--text-4)", lineHeight: 1,
            transition: "color 0.15s ease",
          }}>
            {mounted ? (isDark ? "Sáng" : "Tối") : "Tối"}
          </span>
        </button>
      </nav>
    </>
  );
}
