"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit, Plus, Flame, CheckCircle2,
  Clock, TrendingUp, ArrowRight, BookOpen, Target, Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getWords, getStreak, getSessions, getDueWords } from "@/lib/db";
import { Word, StudySession } from "@/lib/types";

const DAYS = ["CN","T2","T3","T4","T5","T6","T7"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/* ── Streak Ring ── */
function StreakRing({ n }: { n: number }) {
  const r = 46, circ = 2 * Math.PI * r;
  const pct = Math.min(n / 30, 1);
  return (
    <div style={{ position: "relative", width: 112, height: 112, flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: "20%", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,121,160,0.22) 0%, transparent 70%)",
        filter: "blur(8px)",
      }} />
      <svg viewBox="0 0 110 110" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="55" cy="55" r={r} fill="none" stroke="url(#sg)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", filter: "drop-shadow(0 0 5px rgba(232,121,160,0.65))" }} />
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E879A0" /><stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <Flame size={14} color="#E879A0" />
        <span style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1 }}>{n}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase" }}>ngày</span>
      </div>
    </div>
  );
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1B1B35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px" }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#9B8FF5" }}>{payload[0].value} từ</div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color, delay }: { icon: React.ElementType; label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{
        background: "#0E0E1C", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, padding: "18px 16px",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Quick action button ── */
function QuickBtn({ href, icon: Icon, title, sub, gradient, glow }: {
  href: string; icon: React.ElementType; title: string; sub: string; gradient: string; glow: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <motion.div whileTap={{ scale: 0.97 }}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "15px 18px", borderRadius: 18,
          background: gradient, boxShadow: `0 6px 24px ${glow}`,
        }}>
        <div style={{ width: 40, height: 40, borderRadius: 12,
          background: "rgba(255,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>{sub}</div>
        </div>
        <ArrowRight size={16} color="rgba(255,255,255,0.5)" />
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const [words,    setWords]    = useState<Word[]>([]);
  const [streak,   setStreak]   = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [due,      setDue]      = useState(0);
  const [chart,    setChart]    = useState<{ day: string; v: number; today: boolean }[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      const [w, s, sess, dueW] = await Promise.all([
        getWords(), getStreak(), getSessions(), getDueWords(),
      ]);
      setWords(w); setStreak(s); setSessions(sess); setDue(dueW.length);
      const today = new Date().toISOString().split("T")[0];
      setChart(getLast7Days().map(d => ({
        day: DAYS[new Date(d + "T12:00:00").getDay()],
        v: sess.find(s => s.date === d)?.wordsStudied ?? 0,
        today: d === today,
      })));
      setLoading(false);
    })();
  }, []);

  const mastered   = words.filter(w => w.difficulty >= 3).length;
  const todayWords = sessions.find(s => s.date === new Date().toISOString().split("T")[0])?.wordsStudied ?? 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const hardWords = [...words]
    .filter(w => w.reviewCount > 0)
    .sort((a, b) => (a.correctCount / a.reviewCount) - (b.correctCount / b.reviewCount))
    .slice(0, 5);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 34, height: 34, border: "3px solid rgba(123,104,238,0.2)", borderTopColor: "#7B68EE", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 8px" }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginBottom: 4, fontWeight: 500 }}>
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", marginTop: 5, lineHeight: 1.4 }}>
              {due > 0
                ? <><span style={{ color: "#E879A0", fontWeight: 600 }}>{due} từ</span> đang chờ ôn tập</>
                : <span style={{ color: "#2DD4BF" }}>🎉 Không còn từ nào cần ôn hôm nay!</span>}
            </div>
          </div>
          <StreakRing n={streak} />
        </div>
      </motion.div>

      {/* ── Quick actions ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        <QuickBtn
          href="/flashcard"
          icon={BrainCircuit}
          title="Ôn tập Flashcard"
          sub={due > 0 ? `${due} từ đến hạn hôm nay` : "Tất cả từ đã ôn xong!"}
          gradient="linear-gradient(135deg,#7B68EE,#9B8FF5)"
          glow="rgba(123,104,238,0.4)"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <QuickBtn
            href="/practice"
            icon={Target}
            title="Luyện tập"
            sub="4 dạng bài tập"
            gradient="linear-gradient(135deg,#1B1535,#1A1628)"
            glow="rgba(0,0,0,0)"
          />
          <QuickBtn
            href="/vocabulary"
            icon={Plus}
            title="Thêm từ"
            sub="Mở kho từ vựng"
            gradient="linear-gradient(135deg,#0E1C1C,#0D1A1A)"
            glow="rgba(0,0,0,0)"
          />
        </div>
      </motion.div>

      {/* ── Stats 2x2 ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <Stat icon={BookOpen}     label="Tổng từ vựng"    value={words.length}  color="#7B68EE" delay={0.08} />
        <Stat icon={Clock}        label="Cần ôn hôm nay"  value={due}           color="#E879A0" delay={0.11} />
        <Stat icon={CheckCircle2} label="Đã thuộc"         value={mastered}      color="#2DD4BF" delay={0.14} />
        <Stat icon={TrendingUp}   label="Học hôm nay"      value={todayWords}    color="#F59E0B" delay={0.17} />
      </div>

      {/* ── 7-day chart ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ background: "#0E0E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px 16px 12px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>Tiến độ 7 ngày</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>Số từ ôn mỗi ngày</div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chart} barSize={22} barCategoryGap="30%">
            <XAxis dataKey="day" axisLine={false} tickLine={false}
              tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11, fontWeight: 500 }} />
            <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(123,104,238,0.06)", radius: 6 }} />
            <Bar dataKey="v" radius={[6, 6, 2, 2]}>
              {chart.map((e, i) => (
                <Cell key={i} fill={e.today ? "#7B68EE" : e.v > 0 ? "rgba(123,104,238,0.3)" : "rgba(255,255,255,0.04)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Hard words ── */}
      {hardWords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: "#0E0E1C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "18px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>🔥 Từ hay quên nhất</div>
            <Link href="/vocabulary" style={{ display: "flex", alignItems: "center", gap: 4,
              fontSize: 12, fontWeight: 600, color: "#7B68EE", textDecoration: "none" }}>
              Xem tất cả <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {hardWords.map((w, i) => {
              const acc = Math.round((w.correctCount / w.reviewCount) * 100);
              return (
                <div key={w.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 4px", borderBottom: i < hardWords.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", width: 14, textAlign: "right" }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{w.word}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{w.meaning}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: acc < 50 ? "#FB7185" : "#2DD4BF" }}>{acc}%</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{w.reviewCount} lần</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
