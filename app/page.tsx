"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getWords, getStreak, getSessions, getDueWords } from "@/lib/db";
import { Word, StudySession } from "@/lib/types";
import { getRankLevel } from "@/lib/ranks";
import { getGamificationState } from "@/lib/gamification";
import { BrainCircuit, Target, Plus, BookOpen, Clock, CheckCircle2, TrendingUp, Flame, ArrowRight, Sparkles, Trophy, Award } from "lucide-react";

const DAYS = ["CN","T2","T3","T4","T5","T6","T7"];

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

/* ── Neubrutal Stat Card ── */
function StatCard({ label, value, color, icon: Icon, delay }: {
  label: string; value: number; color: string; icon: React.ElementType; delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{
        background: "#FFFFFF",
        border: "2.5px solid #000000",
        borderRadius: 16,
        boxShadow: "4px 4px 0px #000000",
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: color, border: "2px solid #000000",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "2px 2px 0px #000000",
        }}>
          <Icon size={18} color="#000000" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 900, textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 99, background: "#F5EFE6", border: "1.5px solid #000000"
        }}>
          STAT
        </span>
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#000000", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#444444", marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

/* ── Neubrutal Quick Action Button ── */
function QuickBtn({ href, icon: Icon, title, sub, bg }: {
  href: string; icon: React.ElementType; title: string; sub: string; bg: string;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "16px 18px",
          background: bg,
          border: "2.5px solid #000000",
          borderRadius: 16,
          boxShadow: hover ? "6px 6px 0px #000000" : "4px 4px 0px #000000",
          transform: hover ? "translate(-2px, -2px)" : "none",
          transition: "transform 0.08s ease, boxShadow 0.08s ease",
          cursor: "pointer",
        }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: "#FFFFFF", border: "2.5px solid #000000",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "2px 2px 0px #000000",
        }}>
          <Icon size={20} color="#000000" strokeWidth={2.5} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 900, color: "#000000",
            letterSpacing: "-0.01em", marginBottom: 2,
          }}>
            {title}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2B2B" }}>
            {sub}
          </div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: "#FFFFFF", border: "2px solid #000000",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "1.5px 1.5px 0px #000000",
        }}>
          <ArrowRight size={14} color="#000000" strokeWidth={3} />
        </div>
      </div>
    </Link>
  );
}

/* ── Neubrutal Tooltip ── */
function ChartTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#FFFFFF", border: "2.5px solid #000000",
      borderRadius: 8, boxShadow: "3px 3px 0 #000", padding: "6px 12px",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 900, color: "#000" }}>{payload[0].value} từ</div>
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
  const rankLevel  = getRankLevel(mastered);
  const gamificationState = getGamificationState();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const hardWords = [...words]
    .filter(w => w.reviewCount > 0)
    .sort((a, b) => (a.correctCount / a.reviewCount) - (b.correctCount / b.reviewCount))
    .slice(0, 5);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 16 }}>
      <div style={{
        fontSize: 16, fontWeight: 900, color: "#000",
        padding: "10px 20px", background: "#FFE052", border: "2.5px solid #000",
        borderRadius: 12, boxShadow: "4px 4px 0 #000",
      }}>
        ✨ ĐANG TẢI DỮ LIỆU...
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 12px" }}>

      {/* ── Gamification Rank Banner ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
        <Link href="/leaderboard" style={{ textDecoration: "none" }}>
          <div style={{
            border: "2.5px solid #000000",
            borderRadius: 18,
            boxShadow: "4px 4px 0px #000000",
            padding: "14px 18px",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justify: "space-between",
            cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: rankLevel.bg,
                border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, boxShadow: "2px 2px 0 #000", flexShrink: 0,
              }}>
                {rankLevel.badgeEmoji}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 6px", borderRadius: 99, background: "#000", color: "#FFF" }}>
                    LEVEL {rankLevel.level}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: "#000000" }}>
                    {rankLevel.name} ({rankLevel.cefr})
                  </span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#555555", marginTop: 2 }}>
                  {mastered} từ đã thuộc · {gamificationState.xp} XP kinh nghiệm
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 12, fontWeight: 900, color: "#000000",
              padding: "6px 12px", borderRadius: 99, background: "#FFE052",
              border: "2px solid #000", boxShadow: "2px 2px 0 #000",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <Trophy size={14} /> Bảng Hạng ▶
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── Header Hero Card ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
        <div style={{
          border: "2.5px solid #000000",
          borderRadius: 20,
          boxShadow: "5px 5px 0px #000000",
          padding: "20px 22px",
          background: "#FF5964",
          color: "#FFFFFF",
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 900, textTransform: "uppercase",
                padding: "3px 10px", borderRadius: 99, background: "#FFE052", color: "#000000",
                border: "2px solid #000000", display: "inline-block", marginBottom: 8, boxShadow: "2px 2px 0 #000",
              }}>
                📅 {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2, textShadow: "1.5px 1.5px 0 #000" }}>
                {greeting}! 👋
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, marginTop: 6,
                color: "#FFFFFF", opacity: 0.95, textShadow: "1px 1px 0 #000"
              }}>
                {due > 0
                  ? `⚡ Có ${due} từ vựng cần bạn ôn tập hôm nay`
                  : `🎉 Tuyệt vời! Hôm nay bạn đã ôn xong tất cả (${todayWords} từ)`}
              </div>
            </div>

            {/* Streak Badge Card */}
            <div style={{
              border: "2.5px solid #000000",
              borderRadius: 14,
              boxShadow: "3px 3px 0px #000000",
              background: "#FFE052",
              padding: "10px 14px",
              textAlign: "center",
              minWidth: 78,
              color: "#000000",
            }}>
              <Flame size={22} color="#FF5964" style={{ margin: "0 auto 2px" }} />
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{streak}</div>
              <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", marginTop: 2 }}>NGÀY</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>

        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#000000", letterSpacing: "0.06em" }}>
          🚀 HÀNH ĐỘNG NHANH
        </div>

        <QuickBtn href="/flashcard" icon={BrainCircuit} title="Ôn tập Flashcard"
          sub={due > 0 ? `${due} từ vựng đến hạn hôm nay` : "Đã ôn xong tất cả từ!"} bg="#9C8EFA" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <QuickBtn href="/practice" icon={Target} title="Luyện tập" sub="4 dạng bài chơi" bg="#4ECCD3" />
          <QuickBtn href="/vocabulary" icon={Plus} title="Thêm từ vựng" sub="Mở kho từ vựng" bg="#38E54D" />
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#000000", letterSpacing: "0.06em" }}>
          📊 THỐNG KÊ TIẾN ĐỘ
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <StatCard icon={BookOpen}     label="Tổng từ vựng"    value={words.length}  color="#9C8EFA" delay={0.08} />
        <StatCard icon={Clock}        label="Cần ôn hôm nay"  value={due}           color="#FF5964" delay={0.11} />
        <StatCard icon={CheckCircle2} label="Đã thuộc"         value={mastered}      color="#38E54D" delay={0.14} />
        <StatCard icon={TrendingUp}   label="Đã học hôm nay"   value={todayWords}    color="#FFE052" delay={0.17} />
      </div>

      {/* ── 7-Day Progress Chart ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{
          background: "#FFFFFF", border: "2.5px solid #000000",
          borderRadius: 20, boxShadow: "5px 5px 0px #000000",
          padding: "18px 20px 14px", marginBottom: 24,
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#000000" }}>📈 Tiến độ 7 ngày qua</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#555555", marginTop: 2 }}>Số từ vựng đã ôn tập mỗi ngày</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: "#4ECCD3", border: "2px solid #000" }}>
            CHART
          </span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={chart} barSize={20} barCategoryGap="30%">
            <XAxis dataKey="day" axisLine={{ stroke: "#000", strokeWidth: 2 }} tickLine={false}
              tick={{ fill: "#000000", fontSize: 12, fontWeight: 700 }} />
            <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
            <Bar dataKey="v" radius={[6, 6, 0, 0]} stroke="#000000" strokeWidth={2}>
              {chart.map((e, i) => (
                <Cell key={i} fill={e.today ? "#FF5964" : e.v > 0 ? "#FFE052" : "#F5EFE6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ── Hard Words Section ── */}
      {hardWords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: "#FFFFFF", border: "2.5px solid #000000",
            borderRadius: 20, boxShadow: "5px 5px 0px #000000",
            padding: "18px 20px", marginBottom: 10,
          }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#000000" }}>🔥 Từ hay quên nhất</div>
            <Link href="/vocabulary" style={{
              fontSize: 12, fontWeight: 800, color: "#000000", textDecoration: "none",
              padding: "4px 10px", borderRadius: 99, background: "#FFE052", border: "2px solid #000",
              boxShadow: "2px 2px 0 #000", display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              Xem kho từ <ArrowRight size={12} strokeWidth={3} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {hardWords.map((w, i) => {
              const acc = Math.round((w.correctCount / w.reviewCount) * 100);
              return (
                <div key={w.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", border: "2px solid #000000", borderRadius: 12,
                  background: i === 0 ? "#FFF9F0" : "#FFFFFF",
                  boxShadow: "2px 2px 0 #000",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: 6, background: "#FF5964", color: "#FFF",
                      border: "1.5px solid #000", fontWeight: 900, fontSize: 12,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {i + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: "#000000" }}>{w.word}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#444444" }}>{w.meaning}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 900, padding: "3px 8px", borderRadius: 99,
                      background: acc < 50 ? "#FF5964" : "#38E54D", color: acc < 50 ? "#FFF" : "#000",
                      border: "1.5px solid #000", display: "inline-block"
                    }}>
                      {acc}%
                    </span>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#666666", marginTop: 2 }}>
                      {w.reviewCount} lần ôn
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
