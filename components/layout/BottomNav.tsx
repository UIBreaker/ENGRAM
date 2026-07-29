"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Trophy, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/",            icon: Home,         label: "Trang chủ", color: "#FF5964" },
  { href: "/vocabulary",  icon: BookOpen,      label: "Từ vựng",   color: "#FFE052" },
  { href: "/flashcard",   icon: BrainCircuit,  label: "Ôn tập",    color: "#9C8EFA" },
  { href: "/practice",    icon: Target,        label: "Luyện tập", color: "#4ECCD3" },
  { href: "/leaderboard", icon: Trophy,        label: "Bảng Hạng", color: "#FF70A6" },
];

export default function BottomNav() {
  const path = usePathname();
  const { toggle, isDark } = useTheme();
  return (
    <>
      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        .nav-item { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .nav-item:active { transform: translateY(2px); }
      `}</style>
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--sidebar-bg)",
        borderTop: "2.5px solid var(--border-color)",
        boxShadow: "0 -3px 0 var(--border-color)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: 4,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}>
        {nav.map(({ href, icon: Icon, label, color }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className="nav-item" style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              padding: "8px 4px 10px",
              textDecoration: "none",
            }}>
              <div style={{
                padding: "4px 14px",
                borderRadius: 99,
                background: active ? color : "transparent",
                border: active ? "2px solid var(--border-color)" : "2px solid transparent",
                boxShadow: active ? "2px 2px 0 var(--border-color)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.25s ease",
              }}>
                <Icon size={18} color={active ? "#000000" : "var(--text-2)"} strokeWidth={active ? 2.8 : 2} />
              </div>
              <span style={{
                fontSize: 10,
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: active ? 800 : 600,
                color: active ? "var(--text-1)" : "var(--text-3)",
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button onClick={toggle} className="nav-item" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", gap: 3,
          padding: "8px 4px 10px",
          background: "transparent", border: "none", cursor: "pointer",
        }}>
          <div style={{
            padding: "4px 14px", borderRadius: 99,
            background: "transparent",
            border: "2px solid transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {isDark
              ? <Sun size={18} color="var(--text-2)" strokeWidth={2} />
              : <Moon size={18} color="var(--text-2)" strokeWidth={2} />
            }
          </div>
          <span style={{
            fontSize: 10, fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 600, color: "var(--text-3)", lineHeight: 1,
          }}>
            {isDark ? "Sáng" : "Tối"}
          </span>
        </button>
      </nav>
    </>
  );
}
