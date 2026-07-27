"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/",           label: "HOME",   emoji: "🌿" },
  { href: "/vocabulary", label: "VOCAB",  emoji: "📜" },
  { href: "/flashcard",  label: "REVIEW", emoji: "🔮" },
  { href: "/practice",   label: "TRAIN",  emoji: "⚔️" },
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
        background: "#101611",
        borderTop: "2px solid #28352A",
        boxShadow: "0 -3px 0 #090D09",
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {nav.map(({ href, label, emoji }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} className="nav-item" style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3,
              padding: "10px 4px 12px",
              textDecoration: "none",
              background: active ? "#1B241C" : "transparent",
              borderTop: active ? "2px solid #65D376" : "2px solid transparent",
              marginTop: -2,
            }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{emoji}</span>
              <span style={{
                fontSize: 8,
                fontFamily: "var(--font-press-start), 'Press Start 2P', monospace",
                fontWeight: 400,
                color: active ? "#F4EBD9" : "#6F876E",
                lineHeight: 1,
                letterSpacing: "0.04em",
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
