"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Sparkles, Trophy } from "lucide-react";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/",            icon: Home,         label: "Trang chủ",      color: "#FF5964" },
  { href: "/vocabulary",  icon: BookOpen,      label: "Kho từ vựng",    color: "#FFE052" },
  { href: "/flashcard",   icon: BrainCircuit,  label: "Ôn tập từ vựng", color: "#9C8EFA" },
  { href: "/practice",    icon: Target,        label: "Luyện tập",      color: "#4ECCD3" },
  { href: "/leaderboard", icon: Trophy,        label: "Bảng xếp hạng",  color: "#FF70A6" },
];

export default function Sidebar() {
  const path = usePathname();
  const { toggle, isDark, mounted } = useTheme();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }

        .sidebar-navlink {
          transition: transform 0.08s ease, box-shadow 0.1s ease, background 0.15s ease;
        }
        .sidebar-navlink:hover:not(.active-link) {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--border-color) !important;
        }
      `}</style>

      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "var(--sidebar-bg)",
        borderRight: "2.5px solid var(--border-color)",
        display: "flex", flexDirection: "column", zIndex: 40,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}>

        {/* ── Logo Header ── */}
        <div style={{
          padding: "18px 14px 16px",
          borderBottom: "2.5px solid var(--border-color)",
          transition: "border-color 0.2s ease",
        }}>
          <div style={{
            border: "2.5px solid var(--border-color)",
            borderRadius: 14,
            padding: "11px 13px",
            background: "#FF5964",
            boxShadow: "4px 4px 0px var(--border-color)",
            display: "flex", alignItems: "center", gap: 10,
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "#FFE052", border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 0 var(--border-color)", flexShrink: 0,
            }}>
              <Sparkles size={16} color="#000" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
                ENGRAM
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", marginTop: 1, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Neo-Brutalism
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav Links ── */}
        <nav style={{ padding: "18px 12px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: "var(--text-4)", padding: "0 4px 8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            NAVIGATION
          </div>

          {nav.map(({ href, label, icon: Icon, color }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-navlink ${active ? "active-link" : ""}`}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "10px 13px", borderRadius: 12,
                  fontWeight: 800, fontSize: 14,
                  color: active ? "#000000" : "var(--text-1)",
                  background: active ? color : "var(--card-bg)",
                  border: "2.5px solid var(--border-color)",
                  textDecoration: "none",
                  boxShadow: active ? "4px 4px 0px var(--border-color)" : "2.5px 2.5px 0px var(--border-color)",
                  transform: active ? "translate(-1px, -1px)" : "none",
                  transition: "background 0.15s ease, color 0.15s ease, border-color 0.2s ease, box-shadow 0.15s ease, transform 0.08s ease",
                }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: active ? "#FFFFFF" : color,
                  border: "2px solid var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "border-color 0.2s ease, background 0.15s ease",
                }}>
                  <Icon size={13} color="#000000" strokeWidth={2.8} />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div style={{ padding: "12px 12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ─ Theme Toggle Row ─ */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 13px",
            border: "2.5px solid var(--border-color)",
            borderRadius: 12,
            background: "var(--card-bg)",
            boxShadow: "2.5px 2.5px 0px var(--border-color)",
            transition: "background 0.2s ease, border-color 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Icon stays stable until mounted */}
              <span style={{ fontSize: 16, fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>
                {!mounted ? "🌙" : isDark ? "☀️" : "🌙"}
              </span>
              <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text-1)", transition: "color 0.2s ease" }}>
                {!mounted ? "Nền tối" : isDark ? "Nền sáng" : "Nền tối"}
              </span>
            </div>

            {/* Animated pill switch */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              style={{
                position: "relative",
                width: 50, height: 26,
                borderRadius: 99,
                border: "2px solid var(--border-color)",
                background: mounted && isDark ? "#9C8EFA" : "var(--card-bg)",
                cursor: "pointer",
                transition: "background 0.25s ease, border-color 0.2s ease",
                padding: 0,
                boxShadow: "2px 2px 0 var(--border-color)",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: 3, left: 3,
                width: 16, height: 16,
                borderRadius: "50%",
                background: mounted && isDark ? "#FFE052" : "#1A1A2E",
                border: "1.5px solid var(--border-color)",
                transform: mounted && isDark ? "translateX(24px)" : "translateX(0)",
                transition: "transform 0.25s ease, background 0.25s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8,
              }} />
            </button>
          </div>

          {/* ─ Brand Badge ─ */}
          <div style={{
            border: "2.5px solid var(--border-color)",
            borderRadius: 12,
            background: "#FFE052",
            padding: "9px 12px",
            boxShadow: "3px 3px 0px var(--border-color)",
            fontSize: 11, fontWeight: 900, color: "#000000", textAlign: "center",
            letterSpacing: "0.04em", transition: "border-color 0.2s ease",
          }}>
            <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>✨</span>
            {" "}VIBRANT NEO-BRUTALISM
          </div>
        </div>
      </aside>
    </>
  );
}
