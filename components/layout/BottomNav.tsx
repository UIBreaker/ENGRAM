"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BrainCircuit, PenLine } from "lucide-react";

const nav = [
  { href: "/",           icon: LayoutDashboard, label: "Home"     },
  { href: "/vocabulary", icon: BookOpen,         label: "Từ vựng" },
  { href: "/flashcard",  icon: BrainCircuit,     label: "Ôn tập"  },
  { href: "/writing",    icon: PenLine,          label: "Writing"  },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <>
      <style>{`
        @media (min-width: 768px) { .bottom-nav { display: none !important; } }
      `}</style>
      <nav
        className="bottom-nav"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(7,7,15,0.95)",
          borderTop: "1px solid var(--border-med)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          display: "flex",
          /* Proper safe-area for iPhone notch / home bar */
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                /* 52px minimum height for comfortable tap */
                padding: "10px 4px 8px",
                minHeight: 52,
                textDecoration: "none",
                /* Instant tap feedback */
                WebkitTapHighlightColor: "transparent",
                transition: "opacity 0.12s",
                position: "relative",
              }}
            >
              {/* Active indicator pill */}
              {active && (
                <span style={{
                  position: "absolute",
                  top: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "rgba(123,104,238,0.2)",
                  border: "1px solid rgba(123,104,238,0.3)",
                }} />
              )}
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.75}
                color={active ? "#9B8FF5" : "var(--text-4)"}
                style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
              />
              <span style={{
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? "#9B8FF5" : "var(--text-4)",
                letterSpacing: "0.02em",
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
