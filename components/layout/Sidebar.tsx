"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Sparkles } from "lucide-react";

const nav = [
  { href: "/",           icon: Home,         label: "Trang chủ",      color: "#FF5964" },
  { href: "/vocabulary", icon: BookOpen,      label: "Kho từ vựng",    color: "#FFE052" },
  { href: "/flashcard",  icon: BrainCircuit,  label: "Ôn tập",         color: "#9C8EFA" },
  { href: "/practice",   icon: Target,        label: "Luyện tập",      color: "#4ECCD3" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }

        .neo-sidebar-link {
          transition: transform 0.08s ease, box-shadow 0.08s ease;
        }
        .neo-sidebar-link:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0px #000000 !important;
          background: #FFFFFF !important;
          color: #000000 !important;
        }
      `}</style>

      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "#F5EFE6",
        borderRight: "2.5px solid #000000",
        display: "flex", flexDirection: "column", zIndex: 40,
      }}>
        {/* Logo Card Header */}
        <div style={{
          padding: "20px 16px 16px",
          borderBottom: "2.5px solid #000000",
        }}>
          <div style={{
            border: "2.5px solid #000000",
            borderRadius: "14px",
            padding: "12px 14px",
            background: "#FF5964",
            boxShadow: "4px 4px 0px #000000",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#FFFFFF",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#FFE052", border: "2px solid #000",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 0 #000", flexShrink: 0,
            }}>
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16,
                fontWeight: 900,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                textShadow: "1px 1px 0 #000",
              }}>
                ENGRAM
              </div>
              <div style={{
                fontSize: 10,
                color: "#FFFFFF",
                marginTop: 2,
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: 800,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                opacity: 0.9,
              }}>
                NEO-BRUTALISM UI
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "20px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#000000",
            padding: "0 4px 2px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
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
                  padding: "11px 14px",
                  borderRadius: 12,
                  fontFamily: "var(--font-inter), sans-serif",
                  fontWeight: 800, fontSize: 14,
                  color: "#000000",
                  background: active ? color : "#FFFFFF",
                  border: "2.5px solid #000000",
                  textDecoration: "none",
                  boxShadow: active ? "4px 4px 0px #000000" : "3px 3px 0px #000000",
                  transform: active ? "translate(-1px, -1px)" : "none",
                }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: active ? "#FFFFFF" : color,
                  border: "2px solid #000000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={14} color="#000000" strokeWidth={2.5} />
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "16px 14px 20px" }}>
          <div style={{
            border: "2.5px solid #000000",
            borderRadius: 12,
            background: "#FFE052",
            padding: "10px 12px",
            boxShadow: "3px 3px 0px #000000",
            fontSize: 11,
            fontWeight: 800,
            color: "#000000",
            textAlign: "center",
          }}>
            ✨ VIBRANT NEO-BRUTALISM
          </div>
        </div>
      </aside>
    </>
  );
}
