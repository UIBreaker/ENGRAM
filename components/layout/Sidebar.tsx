"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target } from "lucide-react";

const nav = [
  { href: "/",           icon: Home,         label: "Trang chủ",     emoji: "🌿" },
  { href: "/vocabulary", icon: BookOpen,      label: "Kho từ vựng",   emoji: "📜" },
  { href: "/flashcard",  icon: BrainCircuit,  label: "Ôn tập Flashcard", emoji: "🔮" },
  { href: "/practice",   icon: Target,        label: "Luyện tập",     emoji: "⚔️" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }

        .sidebar-link {
          transition: none;
          position: relative;
        }
        .sidebar-link:hover {
          background: rgba(101,211,118,0.08) !important;
          color: #65D376 !important;
          border-color: #364638 !important;
          transform: translateX(3px);
        }
        .sidebar-link.active::before {
          content: '◆';
          color: #65D376;
          margin-right: 6px;
          font-size: 8px;
        }
      `}</style>

      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "#101611",
        borderRight: "2px solid #28352A",
        display: "flex", flexDirection: "column", zIndex: 40,
        boxShadow: "3px 0 0 #090D09",
      }}>
        {/* Logo Header */}
        <div style={{
          padding: "20px 16px 16px", zIndex: 1,
          borderBottom: "2px solid #202B22",
        }}>
          <div style={{
            border: "2px solid #364638",
            padding: "10px 12px",
            background: "#161E17",
            boxShadow: "3px 3px 0 #0A0D0A",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <div style={{ fontSize: 20 }}>🌿</div>
            <div>
              <div style={{
                fontFamily: "var(--font-press-start), 'Press Start 2P', monospace",
                fontSize: 12,
                fontWeight: 400,
                color: "#65D376",
                letterSpacing: "0.04em",
                lineHeight: 1.3,
              }}>
                ENGRAM
              </div>
              <div style={{
                fontSize: 11,
                color: "#B0C4AF",
                marginTop: 2,
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 500,
                letterSpacing: "0.04em",
              }}>
                COZY VOCAB RPG
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "16px 12px", flex: 1, display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
          <div style={{
            fontFamily: "var(--font-press-start), 'Press Start 2P', monospace",
            fontSize: 8,
            color: "#58735A",
            padding: "0 6px 6px",
            letterSpacing: "0.1em",
          }}>
            MENU
          </div>

          {nav.map(({ href, label, emoji }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`sidebar-link${active ? " active" : ""}`}
                style={{
                  display: "flex", alignItems: "center", gap: 0,
                  padding: "10px 12px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 600, fontSize: 13,
                  color: active ? "#F4EBD9" : "#B0C4AF",
                  background: active ? "#202C21" : "transparent",
                  border: active ? "2px solid #485E4B" : "2px solid transparent",
                  textDecoration: "none",
                  boxShadow: active ? "3px 3px 0 #0A0D0A" : "none",
                }}>
                <span style={{ marginRight: 10, fontSize: 16 }}>{emoji}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 12px 20px", zIndex: 1 }}>
          <div style={{
            textAlign: "center",
            fontFamily: "var(--font-press-start), 'Press Start 2P', monospace",
            fontSize: 7, color: "#445643",
            letterSpacing: "0.08em",
          }}>
            COZY PIXEL EDITION
          </div>
        </div>
      </aside>
    </>
  );
}
