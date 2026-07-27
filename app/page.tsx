"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getWords, getStreak, getSessions, getDueWords } from "@/lib/db";
import { Word, StudySession } from "@/lib/types";

const DAYS = ["CN","T2","T3","T4","T5","T6","T7"];
const PX = "var(--font-press-start), 'Press Start 2P', monospace";
const VT = "var(--font-vt323), 'VT323', monospace";

const GREEN  = "#65D376";
const CYAN   = "#4ECDC4";
const PINK   = "#E86A82";
const YELLOW = "#F4C430";
const PURPLE = "#A084E8";

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/* ── Cozy Nature Pixel Stat Card ── */
function StatCard({ label, value, color, emoji, delay }: {
  label: string; value: number; color: string; emoji: string; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{
        background: "#1A221B",
        border: `2px solid #324434`,
        boxShadow: `3px 3px 0 #0A0D0A`,
        padding: "14px 14px",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Corner leaf accent */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: 4, background: color }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: 4, height: 4, background: color }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <span style={{ fontFamily: VT, fontSize: 16, color: "#B0C4AF" }}>{label}</span>
      </div>
      <div style={{
        fontFamily: PX, fontSize: 18, color, lineHeight: 1,
      }}>
        {value}
      </div>
    </motion.div>
  );
}

/* ── Cozy Nature Pixel Quick Action Button ── */
function QuickBtn({ href, emoji, title, sub, color }: {
  href: string; emoji: string; title: string; sub: string; color: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 16px",
          background: hover ? "#222B23" : "#1A221B",
          border: `2px solid ${hover ? color : "#324434"}`,
          boxShadow: hover ? `4px 4px 0 #0A0D0A` : `3px 3px 0 #0A0D0A`,
          transform: hover ? "translate(-1px,-1px)" : "none",
          transition: "none",
          cursor: "pointer",
        }}>
        <div style={{
          width: 38, height: 38, flexShrink: 0,
          border: `2px solid ${color}44`,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: PX, fontSize: 9, color,
            letterSpacing: "0.04em", marginBottom: 4,
          }}>
            {title}
          </div>
          <div style={{ fontFamily: VT, fontSize: 15, color: "#B0C4AF" }}>
            {sub}
          </div>
        </div>
        <div style={{ fontFamily: PX, fontSize: 10, color: color }}>◆</div>
      </div>
    </Link>
  );
}

/* ── Chart Tooltip ── */
function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#131814", border: `2px solid #364638`,
      boxShadow: "3px 3px 0 #0A0D0A", padding: "6px 12px",
      fontFamily: VT,
    }}>
      <div style={{ fontSize: 14, color: "#B0C4AF", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 18, color: GREEN }}>{payload[0].value} từ</div>
    </div>
  );
}

/* ── Streak Display ── */
function StreakBox({ n }: { n: number }) {
  return (
    <div style={{
      border: `2px solid #50372E`,
      boxShadow: `3px 3px 0 #0A0D0A`,
      background: "#221A18",
      padding: "10px 14px",
      textAlign: "center",
      minWidth: 74,
      position: "relative",
    }}>
      <div style={{ fontSize: 18, marginBottom: 2 }}>🔥</div>
      <div style={{
        fontFamily: PX, fontSize: 18, color: "#F38A3A",
        lineHeight: 1,
      }}>
        {n}
      </div>
      <div style={{ fontFamily: VT, fontSize: 13, color: "#C89578", marginTop: 3 }}>
        NGÀY STREAK
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [words,   setWords]   = useState<Word[]>([]);
  const [streak,  setStreak]  = useState(0);
  const [sessions,setSessions]= useState<StudySession[]>([]);
  const [due,     setDue]     = useState(0);
  const [chart,   setChart]   = useState<{ day: string; v: number; today: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

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
  const greeting = hour < 12 ? "BUỔI SÁNG LÀNH" : hour < 18 ? "BUỔI CHIỀU AN" : "BUỔI TỐI ẤM ÁP";

  const hardWords = [...words]
    .filter(w => w.reviewCount > 0)
    .sort((a, b) => (a.correctCount / a.reviewCount) - (b.correctCount / b.reviewCount))
    .slice(0, 5);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 16 }}>
      <div style={{
        fontFamily: PX, fontSize: 10, color: GREEN,
      }}>
        ĐANG TẢI...
      </div>
      <div style={{ width: 140, height: 10, border: `2px solid #364638`, background: "#131814" }}>
        <div style={{
          width: "50%", height: "100%", background: GREEN,
          animation: "loadBar 1.2s steps(6) infinite",
        }} />
      </div>
      <style>{`
        @keyframes loadBar { 0% { width: 0% } 100% { width: 100% } }
      `}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "24px 16px 12px" }}>

      {/* ── Header Card ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{
          border: `2px solid #344436`,
          boxShadow: "3px 3px 0 #0A0D0A",
          padding: "18px 20px",
          background: "#19201A",
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: VT, fontSize: 16, color: "#6F876E", marginBottom: 4 }}>
                🌸 {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div style={{
                fontFamily: PX, fontSize: 12, color: "#F4EBD9", lineHeight: 1.4,
                letterSpacing: "0.04em",
              }}>
                {greeting} 🌱
              </div>
              <div style={{
                fontFamily: VT, fontSize: 18, marginTop: 6,
                color: due > 0 ? PINK : GREEN,
              }}>
                {due > 0
                  ? `🌾 Có ${due} từ vựng cần ôn tập hôm nay`
                  : `✨ Bạn đã hoàn thành xuất sắc bài ôn hôm nay! (+${todayWords} từ)`}
              </div>
            </div>
            <StreakBox n={streak} />
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>

        <div style={{ fontFamily: PX, fontSize: 8, color: "#6F876E", letterSpacing: "0.08em" }}>
          HOẠT ĐỘNG CHÍNH
        </div>

        <QuickBtn href="/flashcard" emoji="🔮" title="ÔN TẬP FLASHCARD"
          sub={due > 0 ? `${due} từ vựng đến hạn` : "Đã hoàn thành ôn tập!"} color={PURPLE} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <QuickBtn href="/practice" emoji="⚔️" title="LUYỆN TẬP" sub="4 chế độ rèn luyện" color={CYAN} />
          <QuickBtn href="/vocabulary" emoji="📜" title="TỪ VỰNG" sub="Kho từ & Thêm mới" color={GREEN} />
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontFamily: PX, fontSize: 8, color: "#6F876E", letterSpacing: "0.08em" }}>
          THỐNG KÊ
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
        <StatCard emoji="📚" label="Tổng từ vựng"    value={words.length}  color={PURPLE} delay={0.08} />
        <StatCard emoji="⏳" label="Cần ôn hôm nay"  value={due}           color={PINK}   delay={0.11} />
        <StatCard emoji="🌱" label="Đã ghi nhớ sâu"  value={mastered}      color={GREEN}  delay={0.14} />
        <StatCard emoji="✨" label="Học hôm nay"      value={todayWords}    color={YELLOW} delay={0.17} />
      </div>

      {/* ── 7-Day Chart ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{
          background: "#19201A", border: `2px solid #344436`,
          boxShadow: "3px 3px 0 #0A0D0A", padding: "16px 16px 10px", marginBottom: 20,
        }}>
        <div style={{ fontFamily: PX, fontSize: 8, color: GREEN, marginBottom: 4, letterSpacing: "0.04em" }}>
          TIẾN ĐỘ 7 NGÀY QUA
        </div>
        <div style={{ fontFamily: VT, fontSize: 16, color: "#B0C4AF", marginBottom: 14 }}>
          Số từ vựng đã ôn tập mỗi ngày
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={chart} barSize={18} barCategoryGap="35%">
            <XAxis dataKey="day" axisLine={false} tickLine={false}
              tick={{ fill: "#B0C4AF", fontSize: 13, fontFamily: VT }} />
            <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(101,211,118,0.05)" }} />
            <Bar dataKey="v" radius={[0,0,0,0]}>
              {chart.map((e, i) => (
                <Cell key={i} fill={e.today ? GREEN : e.v > 0 ? "#3E7B48" : "#222D24"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Hard Words Section ── */}
      {hardWords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: "#19201A", border: `2px solid #483438`,
            boxShadow: "3px 3px 0 #0A0D0A", padding: "16px 16px", marginBottom: 10,
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: PX, fontSize: 8, color: PINK, letterSpacing: "0.04em" }}>
              🍂 TỪ CẦN CHỦ Ý (HAY QUÊN)
            </div>
            <Link href="/vocabulary" style={{
              fontFamily: PX, fontSize: 7, color: GREEN,
              textDecoration: "none", letterSpacing: "0.04em",
            }}>
              [XEM TẤT CẢ ▶]
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {hardWords.map((w, i) => {
              const acc = Math.round((w.correctCount / w.reviewCount) * 100);
              return (
                <div key={w.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 4px",
                  borderBottom: i < hardWords.length - 1 ? `1px solid #283329` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: PX, fontSize: 8, color: "#6F876E", width: 14, textAlign: "right" }}>
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontFamily: PX, fontSize: 9, color: "#F4EBD9", marginBottom: 2 }}>{w.word}</div>
                      <div style={{ fontFamily: VT, fontSize: 16, color: "#B0C4AF" }}>{w.meaning}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: PX, fontSize: 9,
                      color: acc < 50 ? PINK : CYAN,
                    }}>
                      {acc}%
                    </div>
                    <div style={{ fontFamily: VT, fontSize: 14, color: "#6F876E", marginTop: 1 }}>
                      {w.reviewCount} lần ôn
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <style>{`
        a { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
