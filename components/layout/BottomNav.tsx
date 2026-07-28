"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target } from "lucide-react";

const nav = [
  { href: "/",           icon: Home,         label: "Trang chủ", color: "#FF5964" },
  { href: "/vocabulary", icon: BookOpen,      label: "Từ vựng",   color: "#FFE052" },
  { href: "/flashcard",  icon: BrainCircuit,  label: "Ôn tập",    color: "#9C8EFA" },
  { href: "/practice",   icon: Target,        label: "Luyện tập", color: "#4ECCD3" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <>
      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        .nav-item { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .nav-item:active { transform: translateY(2px); }
      `}</style>
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "#F5EFE6",
        borderTop: "2.5px solid #000000",
        boxShadow: "0 -4px 0 #000000",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: 4,
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
                border: active ? "2px solid #000000" : "2px solid transparent",
                boxShadow: active ? "2px 2px 0 #000000" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color="#000000" strokeWidth={active ? 2.8 : 2} />
              </div>
              <span style={{
                fontSize: 11,
                fontFamily: "var(--font-inter), sans-serif",
                fontWeight: active ? 800 : 600,
                color: "#000000",
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
