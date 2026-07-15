"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit, Plus, Flame, CheckCircle2,
  Clock, TrendingUp, ArrowRight, BookOpen,
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
  const r = 50, circ = 2 * Math.PI * r;
  const pct = Math.min(n / 30, 1);
  return (
    <div style={{ position:"relative", width:128, height:128, flexShrink:0 }}>
      <div style={{ position:"absolute", inset:"20%", borderRadius:"50%",
        background:"radial-gradient(circle, rgba(232,121,160,0.25) 0%, transparent 70%)",
        filter:"blur(8px)" }} />
      <svg viewBox="0 0 120 120" style={{ width:"100%", height:"100%", transform:"rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="url(#sg)" strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
            filter:"drop-shadow(0 0 6px rgba(232,121,160,0.7))" }} />
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E879A0" /><stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex",
        flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
        <Flame size={16} color="#E879A0" />
        <span style={{ fontSize:28, fontWeight:800, color:"var(--text-1)", lineHeight:1 }}>{n}</span>
        <span style={{ fontSize:10, color:"var(--text-4)", letterSpacing:"0.12em", textTransform:"uppercase" }}>ngày</span>
      </div>
    </div>
  );
}

function CTip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--bg-overlay)", border:"1px solid var(--border-med)",
      borderRadius:10, padding:"6px 12px" }}>
      <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:700, color:"#9B8FF5" }}>{payload[0].value} từ</div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay }:
  { icon: React.ElementType; label:string; value:number; color:string; delay:number }) {
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
        borderRadius:"var(--r-lg)", padding:"20px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}20`,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize:28, fontWeight:800, color:"var(--text-1)", lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:12, color:"var(--text-3)", marginTop:4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const [words, setWords]     = useState<Word[]>([]);
  const [streak, setStreak]   = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [due, setDue]         = useState(0);
  const [chart, setChart]     = useState<{ day:string; v:number; today:boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [w, s, sess, dueW] = await Promise.all([
        getWords(), getStreak(), getSessions(), getDueWords(),
      ]);
      setWords(w); setStreak(s); setSessions(sess); setDue(dueW.length);
      const today = new Date().toISOString().split("T")[0];
      setChart(getLast7Days().map(d => ({
        day:   DAYS[new Date(d + "T12:00:00").getDay()],
        v:     sess.find(s => s.date === d)?.wordsStudied ?? 0,
        today: d === today,
      })));
      setLoading(false);
    };
    load();
  }, []);

  const mastered   = words.filter(w => w.difficulty >= 3).length;
  const todayWords = sessions.find(
    s => s.date === new Date().toISOString().split("T")[0]
  )?.wordsStudied ?? 0;

  const hour    = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const hard = [...words]
    .filter(w => w.reviewCount > 0)
    .sort((a,b) => (a.correctCount/a.reviewCount) - (b.correctCount/b.reviewCount))
    .slice(0, 5);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      minHeight:"100dvh", gap:12, flexDirection:"column" }}>
      <div style={{ width:36, height:36, border:"3px solid rgba(123,104,238,0.2)",
        borderTopColor:"#7B68EE", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <div style={{ fontSize:13, color:"var(--text-3)" }}>Đang tải dữ liệu...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 24px" }}>

      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
        <div style={{ fontSize:12, color:"var(--text-4)", marginBottom:6, fontWeight:500 }}>
          {new Date().toLocaleDateString("vi-VN",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </div>
        <div style={{ fontSize:26, fontWeight:800, color:"var(--text-1)", lineHeight:1.2 }}>
          {greeting} 👋
        </div>
        <div style={{ fontSize:14, color:"var(--text-3)", marginTop:6 }}>
          {due > 0
            ? <><span style={{ color:"#E879A0", fontWeight:600 }}>{due} từ</span> đang chờ bạn ôn tập hôm nay.</>
            : <span style={{ color:"#2DD4BF" }}>🎉 Không có từ nào cần ôn — Tuyệt vời!</span>}
        </div>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }} className="dashboard-grid">

        {/* ── Left ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            <StatCard icon={BookOpen}     label="Tổng từ vựng"   value={words.length} color="#7B68EE" delay={0.05} />
            <StatCard icon={Clock}        label="Cần ôn hôm nay" value={due}           color="#E879A0" delay={0.10} />
            <StatCard icon={CheckCircle2} label="Đã thuộc"        value={mastered}      color="#2DD4BF" delay={0.15} />
            <StatCard icon={TrendingUp}   label="Học hôm nay"     value={todayWords}    color="#F59E0B" delay={0.20} />
          </div>

          {/* Chart */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
            style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
              borderRadius:"var(--r-lg)", padding:"24px 20px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--text-1)" }}>Tiến độ 7 ngày</div>
                <div style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>Số từ ôn tập mỗi ngày</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={chart} barSize={26} barCategoryGap="30%">
                <XAxis dataKey="day" axisLine={false} tickLine={false}
                  tick={{ fill:"var(--text-3)", fontSize:12, fontWeight:500 }} />
                <Tooltip content={<CTip />} cursor={{ fill:"rgba(123,104,238,0.06)", radius:8 }} />
                <Bar dataKey="v" radius={[7,7,3,3]}>
                  {chart.map((e,i) => (
                    <Cell key={i} fill={e.today?"#7B68EE":e.v>0?"rgba(123,104,238,0.35)":"rgba(255,255,255,0.05)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Hard words */}
          {hard.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
                borderRadius:"var(--r-lg)", padding:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--text-1)" }}>🔥 Từ hay quên nhất</div>
                <Link href="/vocabulary" style={{ display:"flex", alignItems:"center", gap:4,
                  fontSize:12, fontWeight:600, color:"#9B8FF5", textDecoration:"none" }}>
                  Xem tất cả <ArrowRight size={13} />
                </Link>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                {hard.map((w,i) => {
                  const acc = Math.round((w.correctCount/w.reviewCount)*100);
                  return (
                    <div key={w.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"10px 12px", borderRadius:"var(--r-sm)", transition:"background 0.15s" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
                      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:12, color:"var(--text-4)", width:16 }}>{i+1}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:"var(--text-1)" }}>{w.word}</div>
                          <div style={{ fontSize:12, color:"var(--text-3)" }}>{w.meaning}</div>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontWeight:700, fontSize:14, color:acc<50?"#FB7185":"#2DD4BF" }}>{acc}%</div>
                        <div style={{ fontSize:11, color:"var(--text-4)" }}>{w.reviewCount} lần ôn</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Right ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.12 }}
            style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
              borderRadius:"var(--r-lg)", padding:"28px 20px", textAlign:"center",
              display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <StreakRing n={streak} />
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:streak>0?"#E879A0":"var(--text-3)" }}>
                {streak===0?"Bắt đầu streak hôm nay!":streak>=7?"🔥 Streak tuyệt vời!":"🔥 Giữ vững nhé!"}
              </div>
              <div style={{ fontSize:12, color:"var(--text-4)", marginTop:4 }}>
                {streak>0?"Mục tiêu 30 ngày":"Học mỗi ngày để tạo thói quen"}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.22 }}
            style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <Link href="/flashcard" style={{ display:"flex", alignItems:"center", gap:10,
              padding:"14px 18px", borderRadius:"var(--r-md)", textDecoration:"none",
              background:"linear-gradient(135deg,#7B68EE,#9B8FF5)",
              boxShadow:"0 6px 24px rgba(123,104,238,0.45)", transition:"all 0.18s" }}>
              <BrainCircuit size={20} color="white" />
              <div style={{ textAlign:"left", flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"white" }}>Ôn tập ngay</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.65)", marginTop:1 }}>{due} từ đang chờ</div>
              </div>
              <ArrowRight size={16} color="rgba(255,255,255,0.6)" />
            </Link>

            <Link href="/vocabulary" style={{ display:"flex", alignItems:"center", gap:10,
              padding:"13px 18px", borderRadius:"var(--r-md)", textDecoration:"none",
              background:"var(--bg-overlay)", border:"1px solid var(--border-med)", transition:"all 0.15s" }}>
              <div style={{ width:34, height:34, borderRadius:10,
                background:"var(--teal-dim)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Plus size={16} color="var(--teal)" />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"var(--text-1)" }}>Thêm từ mới</div>
                <div style={{ fontSize:11, color:"var(--text-3)" }}>Lưu vào kho từ vựng</div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:860px){.dashboard-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}
