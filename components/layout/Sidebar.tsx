"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home, BookOpen, BrainCircuit, Target, Sparkles, Trophy,
  BookMarked, BarChart3, MessageSquareMore, ShoppingBag,
  CheckSquare, Swords, UserCircle2, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { getDueWords } from "@/lib/db";
import { getGamificationState } from "@/lib/gamification";
import { getRankLevel } from "@/lib/ranks";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
  badge?: number;
  isNew?: boolean;
}

const LEARNING_NAV: NavItem[] = [
  { href: "/",            icon: Home,               label: "Trang chủ",         color: "#FF5964" },
  { href: "/vocabulary",  icon: BookOpen,            label: "Kho từ vựng",       color: "#FFE052" },
  { href: "/flashcard",   icon: BrainCircuit,        label: "Ôn tập từ vựng",    color: "#9C8EFA" },
  { href: "/stories",     icon: BookMarked,          label: "Sổ tay ngữ cảnh",   color: "#FF8E53", isNew: true },
  { href: "/level-test",  icon: BarChart3,           label: "Đánh giá trình độ", color: "#4ECCD3", isNew: true },
  { href: "/ai-chat",     icon: MessageSquareMore,   label: "Giao tiếp AI",      color: "#38E54D", isNew: true },
];

const GAME_NAV: NavItem[] = [
  { href: "/practice",    icon: Target,              label: "Luyện tập",         color: "#4ECCD3" },
  { href: "/leaderboard", icon: Trophy,              label: "Bảng xếp hạng",     color: "#FF70A6" },
  { href: "/shop",        icon: ShoppingBag,         label: "Cửa hàng",          color: "#FFE052", isNew: true },
  { href: "/quests",      icon: CheckSquare,         label: "Nhiệm vụ",          color: "#38E54D", isNew: true },
  { href: "/duel",        icon: Swords,              label: "Thách đấu",         color: "#FF5964", isNew: true },
];

const ACCOUNT_NAV: NavItem[] = [
  { href: "/profile",     icon: UserCircle2,         label: "Hồ sơ cá nhân",    color: "#9C8EFA", isNew: true },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 11px", borderRadius: 10,
        fontWeight: 800, fontSize: 13,
        color: isActive ? "#000000" : "var(--text-1)",
        background: isActive ? item.color : "transparent",
        border: `2px solid ${isActive ? "var(--border-color)" : "transparent"}`,
        textDecoration: "none",
        boxShadow: isActive ? "3px 3px 0px var(--border-color)" : "none",
        transition: "background 0.12s ease, color 0.12s ease, border-color 0.2s ease, box-shadow 0.12s ease",
        position: "relative",
        overflow: "visible",
      }}
      className="sidebar-navlink"
    >
      <div style={{
        width: 22, height: 22, borderRadius: 5,
        background: isActive ? "#FFFFFF" : item.color,
        border: `1.5px solid ${isActive ? "var(--border-color)" : "rgba(0,0,0,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "background 0.12s ease",
      }}>
        <Icon size={12} color="#000000" strokeWidth={3} />
      </div>

      <span style={{ flex: 1, lineHeight: 1.2 }}>{item.label}</span>

      {/* Badge counter */}
      {item.badge && item.badge > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 900,
          background: "#FF5964", color: "#FFFFFF",
          borderRadius: 99, padding: "1px 6px",
          border: "1.5px solid #000000",
          boxShadow: "1px 1px 0 #000",
          minWidth: 18, textAlign: "center",
        }}>
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}

      {/* NEW pill */}
      {item.isNew && !item.badge && (
        <span style={{
          fontSize: 8, fontWeight: 900,
          background: "#38E54D", color: "#000000",
          borderRadius: 99, padding: "1px 5px",
          border: "1.5px solid #000000",
          letterSpacing: "0.03em",
        }}>
          NEW
        </span>
      )}
    </Link>
  );
}

function NavGroup({ label, items, path }: { label: string; items: NavItem[]; path: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{
        fontSize: 9.5, fontWeight: 900, color: "var(--text-4)",
        padding: "4px 4px 2px", letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        {label}
      </div>
      {items.map(item => {
        const isActive = item.href === "/" ? path === "/" : path.startsWith(item.href);
        return <NavLink key={item.href} item={item} isActive={isActive} />;
      })}
    </div>
  );
}

export default function Sidebar() {
  const path = usePathname();
  const { toggle, isDark, mounted } = useTheme();
  const [dueCount, setDueCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [rankLabel, setRankLabel] = useState("Tân Sinh Viên");

  useEffect(() => {
    getDueWords().then(words => setDueCount(words.length));
    const gs = getGamificationState();
    setXp(gs.xp);
    const rank = getRankLevel(gs.xp);
    setRankLabel(rank.name);
  }, []);

  // Inject badge counts
  const learningNav = LEARNING_NAV.map(item =>
    item.href === "/flashcard" ? { ...item, badge: dueCount } : item
  );

  return (
    <>
      <style>{`
        @media (max-width: 767px) { .sidebar-wrap { display: none !important; } }
        .sidebar-navlink:hover { background: var(--bg-surface) !important; border-color: var(--border-color) !important; }
        .sidebar-navlink.active-link:hover { background: inherit !important; }
        .theme-pill-btn:hover { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 var(--border-color) !important; }
        .theme-pill-btn:active { transform: translate(1px,1px) !important; box-shadow: 0px 0px 0 var(--border-color) !important; }
      `}</style>

      <aside className="sidebar-wrap" style={{
        position: "fixed", left: 0, top: 0, height: "100dvh", width: 220,
        background: "var(--sidebar-bg)",
        borderRight: "2.5px solid var(--border-color)",
        display: "flex", flexDirection: "column", zIndex: 40,
        transition: "background 0.2s ease, border-color 0.2s ease",
        overflowY: "auto", overflowX: "hidden",
      }}>

        {/* ── Logo + User Mini-Profile ── */}
        <div style={{
          padding: "16px 12px 14px",
          borderBottom: "2px solid var(--border-color)",
          transition: "border-color 0.2s ease",
        }}>
          {/* Logo */}
          <div style={{
            border: "2.5px solid var(--border-color)",
            borderRadius: 12, padding: "10px 12px",
            background: "#FF5964",
            boxShadow: "3px 3px 0px var(--border-color)",
            display: "flex", alignItems: "center", gap: 9,
            marginBottom: 10,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "#FFE052", border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 0 var(--border-color)", flexShrink: 0,
            }}>
              <Sparkles size={14} color="#000" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#FFF", letterSpacing: "-0.02em", lineHeight: 1, textShadow: "1px 1px 0 rgba(0,0,0,0.3)" }}>
                ENGRAM
              </div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.85)", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 1 }}>
                Learn Smart
              </div>
            </div>
          </div>

          {/* User mini-profile */}
          <Link href="/profile" style={{
            display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
            padding: "8px 10px", borderRadius: 10,
            border: "2px solid var(--border-color)", background: "var(--card-bg)",
            boxShadow: "2px 2px 0 var(--border-color)",
            transition: "background 0.12s, transform 0.08s",
          }}
          className="sidebar-navlink">
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#FFE052", border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
              fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji",
            }}>
              🎓
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Học viên ENGRAM
              </div>
              <div style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>✨</span>
                {rankLabel} · {xp} XP
              </div>
            </div>
            <ChevronRight size={12} color="var(--text-4)" />
          </Link>
        </div>

        {/* ── Navigation Groups ── */}
        <nav style={{ padding: "14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <NavGroup label="HỌC TẬP" items={learningNav} path={path} />
          <NavGroup label="GAME & ĐỘNG LỰC" items={GAME_NAV} path={path} />
          <NavGroup label="TÀI KHOẢN" items={ACCOUNT_NAV} path={path} />
        </nav>

        {/* ── Footer: Theme Toggle ── */}
        <div style={{ padding: "10px 10px 16px", borderTop: "2px solid var(--border-color)", transition: "border-color 0.2s" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 11px",
            border: "2px solid var(--border-color)",
            borderRadius: 10,
            background: "var(--card-bg)",
            boxShadow: "2px 2px 0px var(--border-color)",
            transition: "background 0.2s ease, border-color 0.2s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 15, fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>
                {mounted ? (isDark ? "☀️" : "🌙") : "🌙"}
              </span>
              <span style={{ fontWeight: 800, fontSize: 12, color: "var(--text-1)", transition: "color 0.2s" }}>
                {mounted ? (isDark ? "Nền sáng" : "Nền tối") : "Nền tối"}
              </span>
            </div>

            {/* Pill toggle switch */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="theme-pill-btn"
              style={{
                position: "relative", width: 44, height: 24,
                borderRadius: 99,
                border: "2px solid var(--border-color)",
                background: mounted && isDark ? "#9C8EFA" : "#E8E0D5",
                cursor: "pointer",
                transition: "background 0.25s ease, border-color 0.2s, box-shadow 0.1s",
                padding: 0, flexShrink: 0,
                boxShadow: "2px 2px 0 var(--border-color)",
              }}
            >
              <div style={{
                position: "absolute", top: "50%",
                left: mounted && isDark ? "calc(100% - 20px)" : "3px",
                transform: "translateY(-50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: mounted && isDark ? "#FFE052" : "#333",
                border: "1.5px solid var(--border-color)",
                transition: "left 0.25s ease, background 0.25s ease",
              }} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
