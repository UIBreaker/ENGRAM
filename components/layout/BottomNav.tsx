"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BrainCircuit, Target, Zap } from "lucide-react";

const nav = [
  { href: "/",           icon: Home,         label: "Home"     },
  { href: "/vocabulary", icon: BookOpen,      label: "Từ vựng"  },
  { href: "/flashcard",  icon: BrainCircuit,  label: "Ôn tập"   },
  { href: "/practice",   icon: Target,        label: "Bài tập"  },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <>
      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
        .nav-item { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .nav-item:active .nav-icon { transform: scale(0.88); }
        .nav-icon { transition: transform 0.12s ease; }
      `}</style>
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,7,15,0.92)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingTop: 4,
      }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className="nav-item" style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4,
              padding: "8px 4px 10px",
              textDecoration: "none",
              position: "relative",
            }}>
              {/* Active glow pill */}
              {active && (
                <span style={{
                  position: "absolute",
                  top: 6,
                  width: 40,
                  height: 34,
                  borderRadius: 12,
                  background: "rgba(123,104,238,0.18)",
                  border: "1px solid rgba(123,104,238,0.28)",
                }} />
              )}
              <span className="nav-icon" style={{ position: "relative", zIndex: 1 }}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? "#9B8FF5" : "rgba(255,255,255,0.28)"}
                />
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? "#9B8FF5" : "rgba(255,255,255,0.28)",
                lineHeight: 1,
                position: "relative", zIndex: 1,
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
