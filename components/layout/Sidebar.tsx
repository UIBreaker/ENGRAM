"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Sparkles, Trophy, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

const nav = [
  { href: "/",            icon: Home,         label: "Trang chủ",     color: "#FF5964" },
  { href: "/vocabulary",  icon: BookOpen,      label: "Kho từ vựng",   color: "#FFE052" },
  { href: "/flashcard",   icon: BrainCircuit,  label: "Ôn tập từ vựng",color: "#9C8EFA" },
  { href: "/practice",    icon: Target,        label: "Luyện tập",     color: "#4ECCD3" },
  { href: "/leaderboard", icon: Trophy,        label: "Bảng xếp hạng", color: "#FF70A6" },
];

export default function Sidebar() {
  const path = usePathname();
  const { toggle, isDark } = useTheme();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }

        .neo-sidebar-link {
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .neo-sidebar-link:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px var(--border-color) !important;
        }

        .theme-toggle-btn {
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .theme-toggle-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--border-color) !important;
        }
        .theme-toggle-btn:active {
          transform: translate(2px, 2px) !important;
          box-shadow: 1px 1px 0px var(--border-color) !important;
        }
      `}</style>

      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "var(--sidebar-bg)",
        borderRight: "2.5px solid var(--border-color)",
        display: "flex", flexDirection: "column", zIndex: 40,
        transition: "background 0.25s ease, border-color 0.25s ease",
      }}>
        {/* Logo Card Header */}
        <div style={{
          padding: "20px 16px 16px",
          borderBottom: "2.5px solid var(--border-color)",
          transition: "border-color 0.25s ease",
        }}>
          <div style={{
            border: "2.5px solid var(--border-color)",
            borderRadius: "14px",
            padding: "12px 14px",
            background: "#FF5964",
            boxShadow: "4px 4px 0px var(--border-color)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#FFFFFF",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#FFE052", border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 0 var(--border-color)", flexShrink: 0,
              transition: "border-color 0.25s ease",
            }}>
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16, fontWeight: 900, color: "#FFFFFF",
                letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: "1px 1px 0 #000",
              }}>
                ENGRAM
              </div>
              <div style={{
                fontSize: 10, color: "#FFFFFF", marginTop: 2,
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase", opacity: 0.9,
              }}>
                NEO-BRUTALISM UI
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "20px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 11, fontWeight: 900, color: "var(--text-3)",
            padding: "0 4px 2px", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            MENU NAV
          </div>

          {nav.map(({ href, label, icon: Icon, color }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href}
                className="neo-sidebar-link"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12,
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 800, fontSize: 14,
                  color: active ? "#000000" : "var(--text-1)",
                  background: active ? color : "var(--card-bg)",
                  border: "2.5px solid var(--border-color)",
                  textDecoration: "none",
                  boxShadow: active ? "4px 4px 0px var(--border-color)" : "3px 3px 0px var(--border-color)",
                  transform: active ? "translate(-1px, -1px)" : "none",
                  transition: "background 0.12s ease, color 0.12s ease, border-color 0.25s ease",
                }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: active ? "#FFFFFF" : color,
                  border: "2px solid var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "border-color 0.25s ease",
                }}>
                  <Icon size={14} color="#000000" strokeWidth={2.5} />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — Theme Toggle */}
        <div style={{ padding: "14px 14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Theme toggle button */}
          <button
            onClick={toggle}
            className="theme-toggle-btn"
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "11px 14px", borderRadius: 12,
              border: "2.5px solid var(--border-color)",
              background: isDark ? "#1E1E35" : "#FFFFFF",
              boxShadow: "3px 3px 0px var(--border-color)",
              cursor: "pointer", fontWeight: 800, fontSize: 14,
              color: "var(--text-1)", fontFamily: "var(--font-inter), sans-serif",
              transition: "background 0.25s ease, border-color 0.25s ease",
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: isDark ? "#FFE052" : "#1A1A2E",
              border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.25s ease",
            }}>
              {isDark
                ? <Sun size={14} color="#000000" strokeWidth={2.5} />
                : <Moon size={14} color="#FFFFFF" strokeWidth={2.5} />
              }
            </div>
            {isDark ? "Nền sáng" : "Nền tối"}
          </button>

          <div style={{
            border: "2.5px solid var(--border-color)",
            borderRadius: 12,
            background: "#FFE052",
            padding: "10px 12px",
            boxShadow: "3px 3px 0px var(--border-color)",
            fontSize: 11, fontWeight: 800, color: "#000000", textAlign: "center",
            transition: "border-color 0.25s ease",
          }}>
            ✨ VIBRANT NEO-BRUTALISM
          </div>
        </div>
      </aside>
    </>
  );
}
