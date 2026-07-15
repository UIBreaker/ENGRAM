"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BrainCircuit, PenLine } from "lucide-react";

const nav = [
  { href: "/",           icon: LayoutDashboard, label: "Home"       },
  { href: "/vocabulary", icon: BookOpen,         label: "Từ vựng"   },
  { href: "/flashcard",  icon: BrainCircuit,     label: "Ôn tập"    },
  { href: "/writing",    icon: PenLine,          label: "Writing"   },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <>
      <style>{`@media (min-width: 768px) { .bottom-nav { display: none !important; } }`}</style>
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "rgba(7,7,15,0.92)",
        borderTop: "1px solid var(--border-med)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}>
        {nav.map(({ href, icon: Icon, label }) => {
          const active = path === href;
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 4, padding: "10px 4px 4px",
              textDecoration: "none", transition: "all 0.15s",
            }}>
              <div style={{
                width: 40, height: 32, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "rgba(123,104,238,0.18)" : "transparent",
                transition: "all 0.18s",
              }}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75}
                  color={active ? "#9B8FF5" : "var(--text-4)"} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600,
                color: active ? "#9B8FF5" : "var(--text-4)",
                letterSpacing: "0.02em",
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
