"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getWords, getStreak, getSessions, getDueWords } from "@/lib/db";
import { Word, StudySession } from "@/lib/types";
import { getRankLevel } from "@/lib/ranks";
import { getGamificationState } from "@/lib/gamification";
import {
  BrainCircuit, Target, Plus, BookOpen, Clock, CheckCircle2,
  TrendingUp, Flame, ArrowRight, Sparkles, Trophy, BookMarked,
  MessageSquareMore, CheckSquare, Swords,
} from "lucide-react";
import {
  containerVariants, cardVariants, heroVariants, fadeVariants, pageVariants,
} from "@/lib/animations";

const DAYS = ["CN","T2","T3","T4","T5","T6","T7"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/* ── Animated Number Counter ── */
function Counter({ to, duration = 0.8, delay = 0 }: { to: number; duration?: number; delay?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(count, to, { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] });
    const unsub = rounded.on("change", v => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [to]);
  return <>{display}</>;
}

/* ── Skeleton Block ── */
function Skeleton({ w = "100%", h = 20, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, color, icon: Icon, delay, loaded }:
  { label: string; value: number; color: string; icon: React.ElementType; delay: number; loaded: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "var(--card-bg)",
        border: "2.5px solid var(--border-color)",
        borderRadius: 16,
        boxShadow: hover ? "var(--neo-shadow-lg)" : "var(--neo-shadow)",
        transform: hover ? "translate(-2px,-2px)" : "none",
        padding: "16px 14px",
        display: "flex", flexDirection: "column", gap: 10,
        transition: "transform 0.08s ease, box-shadow 0.08s ease, background 0.2s, border-color 0.2s",
        cursor: "default",
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: color, border: "2px solid var(--border-color)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "2px 2px 0px var(--border-color)",
          transition: "border-color 0.2s",
        }}>
          <Icon size={18} color="#000000" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 99,
          background: "var(--bg-base)", border: "1.5px solid var(--border-color)",
          color: "var(--text-3)",
          transition: "background 0.2s, border-color 0.2s, color 0.2s",
        }}>
          STAT
        </span>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)", lineHeight: 1 }}>
          {loaded ? <Counter to={value} delay={delay} /> : <Skeleton w={60} h={26} r={6} />}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Quick Action Button ── */
function QuickBtn({ href, icon: Icon, title, sub, bg, delay }: {
  href: string; icon: React.ElementType; title: string; sub: string; bg: string; delay?: number;
}) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div variants={cardVariants}>
      <Link href={href} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
        <div
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "15px 18px",
            background: bg,
            border: "2.5px solid var(--border-color)",
            borderRadius: 16,
            boxShadow: hover ? "var(--neo-shadow-lg)" : "var(--neo-shadow)",
            transform: hover ? "translate(-2px,-2px)" : "none",
            transition: "transform 0.08s ease, box-shadow 0.08s ease, border-color 0.2s",
            cursor: "pointer",
          }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "rgba(255,255,255,0.9)", border: "2.5px solid var(--border-color)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "2px 2px 0px var(--border-color)",
            transition: "border-color 0.2s",
          }}>
            <Icon size={20} color="#000000" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#000000", letterSpacing: "-0.01em", marginBottom: 2 }}>
              {title}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2B2B", opacity: 0.85 }}>{sub}</div>
          </div>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "rgba(255,255,255,0.9)", border: "2px solid var(--border-color)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "1.5px 1.5px 0px var(--border-color)",
            transition: "border-color 0.2s",
          }}>
            <ArrowRight size={14} color="#000000" strokeWidth={3} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Chart Tooltip ── */
function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--card-bg)", border: "2.5px solid var(--border-color)",
      borderRadius: 8, boxShadow: "var(--neo-shadow)", padding: "6px 12px",
      transition: "background 0.2s, border-color 0.2s",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-1)" }}>{payload[0].value} từ</div>
    </div>
  );
}

/* ── Section Label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 900, textTransform: "uppercase",
      color: "var(--text-3)", letterSpacing: "0.08em",
      marginBottom: 10,
      display: "flex", alignItems: "center", gap: 6,
    }}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [words,    setWords]    = useState<Word[]>([]);
  const [streak,   setStreak]   = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [due,      setDue]      = useState(0);
  const [chart,    setChart]    = useState<{ day: string; v: number; today: boolean }[]>([]);
  const [loaded,   setLoaded]   = useState(false);

  useEffect(() => {
    (async () => {
      const [w, s, sess, dueW] = await Promise.all([
        getWords(), getStreak(), getSessions(), getDueWords(),
      ]);
      setWords(w); setStreak(s); setSessions(sess); setDue(dueW.length);
      const today = new Date().toISOString().split("T")[0];
      setChart(getLast7Days().map(d => ({
        day: DAYS[new Date(d + "T12:00:00").getDay()],
        v: sess.find(s2 => s2.date === d)?.wordsStudied ?? 0,
        today: d === today,
      })));
      setLoaded(true);
    })();
  }, []);

  const mastered    = words.filter(w => w.difficulty >= 3).length;
  const todayWords  = sessions.find(s => s.date === new Date().toISOString().split("T")[0])?.wordsStudied ?? 0;
  const rankLevel   = getRankLevel(mastered);
  const gamState    = getGamificationState();

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const hardWords = [...words]
    .filter(w => w.reviewCount > 0)
    .sort((a, b) => (a.correctCount / a.reviewCount) - (b.correctCount / b.reviewCount))
    .slice(0, 5);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 12px" }}
    >
      {/* ── Rank / XP Banner ── */}
      <motion.div variants={heroVariants} style={{ marginBottom: 14 }}>
        <Link href="/leaderboard" style={{ textDecoration: "none" }}>
          <div
            className="neo-card card-hover"
            style={{
              borderRadius: 18, padding: "13px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: rankLevel.bg,
                border: "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, boxShadow: "2px 2px 0 var(--border-color)", flexShrink: 0,
                fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji",
              }}>
                {rankLevel.badgeEmoji}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 99,
                    background: "var(--text-1)", color: "var(--card-bg)",
                    transition: "background 0.2s, color 0.2s",
                  }}>
                    LV {rankLevel.level}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "var(--text-1)" }}>
                    {rankLevel.name} · {rankLevel.cefr}
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-3)", marginTop: 2 }}>
                  {mastered} từ đã thuộc · {gamState.xp} XP
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 900, color: "#000000",
              padding: "5px 11px", borderRadius: 99, background: "#FFE052",
              border: "2px solid var(--border-color)", display: "flex", alignItems: "center", gap: 4,
              boxShadow: "2px 2px 0 var(--border-color)", whiteSpace: "nowrap",
              transition: "border-color 0.2s",
            }}>
              <Trophy size={13} strokeWidth={2.5} /> Bảng Hạng
            </span>
          </div>
        </Link>
      </motion.div>

      {/* ── Hero Greeting Card ── */}
      <motion.div variants={heroVariants} style={{ marginBottom: 20 }}>
        <div style={{
          border: "2.5px solid var(--border-color)",
          borderRadius: 20, boxShadow: "var(--neo-shadow-lg)",
          padding: "20px 20px", background: "#FF5964", color: "#FFFFFF",
          position: "relative", overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 10, fontWeight: 900, textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 99, background: "#FFE052", color: "#000000",
                border: "2px solid #000000", display: "inline-block", marginBottom: 8,
                boxShadow: "2px 2px 0 #000",
              }}>
                <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>📅</span>{" "}
                {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2, textShadow: "1.5px 1.5px 0 rgba(0,0,0,0.25)" }}>
                {greeting}!{" "}
                <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>👋</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: "#FFFFFF", opacity: 0.92 }}>
                {due > 0
                  ? `⚡ Có ${due} từ vựng cần ôn tập hôm nay`
                  : `🎉 Tuyệt! Hôm nay đã ôn xong tất cả (${todayWords} từ)`}
              </div>

              {/* XP Progress Bar */}
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>
                  <span>XP: {gamState.xp}</span>
                  <span>Tiếp: {rankLevel.maxWords} từ</span>
                </div>
                <div style={{ height: 7, background: "rgba(0,0,0,0.25)", borderRadius: 99, border: "1.5px solid rgba(0,0,0,0.3)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (mastered / Math.max(rankLevel.maxWords, 1)) * 100)}%` }}
                    transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ height: "100%", background: "#FFE052", borderRadius: 99 }}
                  />
                </div>
              </div>
            </div>

            {/* Streak Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 20 }}
              style={{
                border: "2.5px solid #000000", borderRadius: 14,
                boxShadow: "3px 3px 0px #000000", background: "#FFE052",
                padding: "10px 14px", textAlign: "center", minWidth: 72, color: "#000000",
              }}>
              <Flame size={22} color="#FF5964" style={{ margin: "0 auto 2px" }} />
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
                {loaded ? <Counter to={streak} delay={0.4} /> : streak}
              </div>
              <div style={{ fontSize: 9, fontWeight: 900, textTransform: "uppercase", marginTop: 2, letterSpacing: "0.06em" }}>
                NGÀY
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <SectionLabel>
        <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>🚀</span>
        HÀNH ĐỘNG NHANH
      </SectionLabel>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}
      >
        <QuickBtn href="/flashcard" icon={BrainCircuit} title="Ôn tập Flashcard"
          sub={due > 0 ? `${due} từ vựng đến hạn hôm nay` : "Đã ôn xong tất cả từ!"} bg="#9C8EFA" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <QuickBtn href="/practice"    icon={Target}            title="Luyện tập"      sub="4 dạng bài" bg="#4ECCD3" />
          <QuickBtn href="/quests"      icon={CheckSquare}       title="Nhiệm vụ"       sub="Daily quests" bg="#FFE052" />
          <QuickBtn href="/duel"        icon={Swords}            title="Thách đấu"      sub="1v1 battle" bg="#FF70A6" />
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <SectionLabel>
        <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>📊</span>
        THỐNG KÊ TIẾN ĐỘ
      </SectionLabel>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}
      >
        <StatCard icon={BookOpen}     label="Tổng từ vựng"   value={words.length} color="#9C8EFA" delay={0.1}  loaded={loaded} />
        <StatCard icon={Clock}        label="Cần ôn hôm nay" value={due}          color="#FF5964" delay={0.15} loaded={loaded} />
        <StatCard icon={CheckCircle2} label="Đã thuộc"        value={mastered}     color="#38E54D" delay={0.2}  loaded={loaded} />
        <StatCard icon={TrendingUp}   label="Học hôm nay"    value={todayWords}   color="#FFE052" delay={0.25} loaded={loaded} />
      </motion.div>

      {/* ── 7-Day Chart ── */}
      <motion.div
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        style={{
          background: "var(--card-bg)", border: "2.5px solid var(--border-color)",
          borderRadius: 20, boxShadow: "var(--neo-shadow-lg)",
          padding: "18px 20px 14px", marginBottom: 22,
          transition: "background 0.2s, border-color 0.2s",
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-1)" }}>
              <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>📈</span>{" "}
              Tiến độ 7 ngày qua
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginTop: 2 }}>
              Số từ ôn tập mỗi ngày
            </div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 99,
            background: "#4ECCD3", border: "2px solid var(--border-color)",
            color: "#000000", boxShadow: "2px 2px 0 var(--border-color)",
            transition: "border-color 0.2s",
          }}>
            CHART
          </span>
        </div>
        {loaded ? (
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chart} barSize={20} barCategoryGap="30%">
              <XAxis dataKey="day" axisLine={{ stroke: "var(--border-color)", strokeWidth: 2 }}
                tickLine={false} tick={{ fill: "var(--text-2)", fontSize: 12, fontWeight: 700 }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "var(--dot-color)" }} />
              <Bar dataKey="v" radius={[6, 6, 0, 0]} stroke="var(--border-color)" strokeWidth={2}>
                {chart.map((e, i) => (
                  <Cell key={i} fill={e.today ? "#FF5964" : e.v > 0 ? "#FFE052" : "var(--bg-surface)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
            {[60, 80, 45, 90, 55, 100, 70].map((h, i) => (
              <div key={i} className="skeleton" style={{ flex: 1, height: h, borderRadius: "6px 6px 0 0" }} />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Hard Words ── */}
      <AnimatePresence>
        {hardWords.length > 0 && loaded && (
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              background: "var(--card-bg)", border: "2.5px solid var(--border-color)",
              borderRadius: 20, boxShadow: "var(--neo-shadow-lg)",
              padding: "18px 20px", marginBottom: 10,
              transition: "background 0.2s, border-color 0.2s",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--text-1)" }}>
                <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>🔥</span>{" "}
                Từ hay quên nhất
              </div>
              <Link href="/vocabulary" style={{
                fontSize: 12, fontWeight: 800, color: "#000000", textDecoration: "none",
                padding: "4px 10px", borderRadius: 99, background: "#FFE052",
                border: "2px solid var(--border-color)", display: "inline-flex", alignItems: "center", gap: 4,
                boxShadow: "2px 2px 0 var(--border-color)", transition: "border-color 0.2s",
              }}>
                Xem kho từ <ArrowRight size={12} strokeWidth={3} />
              </Link>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {hardWords.map((w, i) => {
                const acc = Math.round((w.correctCount / w.reviewCount) * 100);
                return (
                  <motion.div
                    key={w.id}
                    variants={cardVariants}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", border: "2px solid var(--border-color)", borderRadius: 12,
                      background: i === 0 ? "rgba(255,89,100,0.08)" : "var(--bg-surface)",
                      boxShadow: "2px 2px 0 var(--border-color)",
                      transition: "background 0.2s, border-color 0.2s",
                    }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        width: 24, height: 24, borderRadius: 6, background: "#FF5964", color: "#FFF",
                        border: "1.5px solid var(--border-color)", fontWeight: 900, fontSize: 12,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "border-color 0.2s",
                      }}>
                        {i + 1}
                      </span>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--text-1)" }}>{w.word}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)" }}>{w.meaning}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: 12, fontWeight: 900, padding: "3px 8px", borderRadius: 99,
                        background: acc < 50 ? "#FF5964" : "#38E54D",
                        color: acc < 50 ? "#FFF" : "#000",
                        border: "1.5px solid var(--border-color)", display: "inline-block",
                        transition: "border-color 0.2s",
                      }}>
                        {acc}%
                      </span>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-4)", marginTop: 2 }}>
                        {w.reviewCount} lần
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Features Row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}
      >
        {[
          { href: "/practice",   emoji: "🎯", label: "Luyện tập", color: "#4ECCD3" },
          { href: "/quests",     emoji: "✅", label: "Nhiệm vụ", color: "#38E54D" },
          { href: "/vocabulary", emoji: "📚", label: "Kho từ vựng", color: "#FFE052" },
        ].map(({ href, emoji, label, color }) => (
          <motion.div key={href} variants={cardVariants}>
            <Link href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--card-bg)", border: "2.5px solid var(--border-color)",
                  borderRadius: 14, boxShadow: "var(--neo-shadow)",
                  padding: "14px 10px", textAlign: "center",
                  cursor: "pointer",
                  transition: "background 0.2s, border-color 0.2s, transform 0.08s, box-shadow 0.08s",
                }}
                className="neo-card card-hover"
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: color, border: "2px solid var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, margin: "0 auto 8px",
                  boxShadow: "2px 2px 0 var(--border-color)",
                  fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji",
                  transition: "border-color 0.2s",
                }}>
                  {emoji}
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
                  {label}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

    </motion.div>
  );
}
