"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, popVariants, slideUpVariants, fadeVariants, heroVariants } from "@/lib/animations";
import { getWords, getStreak, getSessions } from "@/lib/db";
import { getGamificationState, BADGES } from "@/lib/gamification";
import { getRankLevel } from "@/lib/ranks";
import { useTheme } from "@/lib/theme";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Settings, Download, HelpCircle, Lock, Moon, Sun, Edit2, Flame, BookOpen, Clock, Star } from "lucide-react";

export default function ProfilePage() {
  const { isDark, toggle, mounted } = useTheme();
  
  const [stats, setStats] = useState({
    totalWords: 0,
    streak: 0,
    daysStudied: 0,
    xp: 0
  });
  
  const [gamification, setGamification] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<any>(null);

  function Skeleton({ w = '100%', h = 20, r = 8 }: { w?: number | string; h?: number; r?: number }) {
    return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-bg)', overflow: 'hidden', border: '1.5px solid var(--border-color)' }}>
      <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
    </div>;
  }

  function CountUpNumber({ value }: { value: number }) {
    const motionVal = useMotionValue(0);
    const displayVal = useTransform(motionVal, Math.round);
    useEffect(() => {
      animate(motionVal, value, { duration: 1.5, ease: "easeOut" });
    }, [value, motionVal]);
    return <motion.span>{displayVal}</motion.span>;
  }

  const [chartData, setChartData] = useState([
    { name: "Cơ bản", words: 45 },
    { name: "IT", words: 30 },
    { name: "Kinh doanh", words: 15 },
    { name: "Giao tiếp", words: 25 },
    { name: "Khác", words: 10 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const words = await getWords();
        const streak = await getStreak();
        const sess = await getSessions();
        const gState = await getGamificationState();
        
        setStats({
          totalWords: words.length,
          streak: streak,
          daysStudied: sess.length,
          xp: gState.xp
        });
        
        setGamification(gState);
        setSessions(sess);
        setRank(getRankLevel(gState.xp));
        
        // Mock chart data generation from words
        if (words.length > 0) {
          const topicCounts: Record<string, number> = {};
          words.forEach(w => {
            const t = w.topic || "Khác";
            topicCounts[t] = (topicCounts[t] || 0) + 1;
          });
          const cData = Object.keys(topicCounts).map(k => ({ name: k, words: topicCounts[k] }));
          setChartData(cData.slice(0, 5));
        }
      } catch (e) {
        console.error("Error loading profile data", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" }}>
        <Skeleton h={200} />
        <div style={{ display: "flex", gap: "16px" }}>
          <Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} /><Skeleton h={100} />
        </div>
        <Skeleton h={300} />
      </div>
    );
  }

  // Calendar Heatmap generation
  const today = new Date();
  const heatmapDays = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const studied = sessions.find(s => s.startTime.startsWith(dateStr));
    heatmapDays.push({
      date: dateStr,
      studied: !!studied,
      intensity: studied ? Math.floor(Math.random() * 3) + 1 : 0 // Mock intensity
    });
  }

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return "var(--bg-base)";
    if (intensity === 1) return "#a6f0b4";
    if (intensity === 2) return "#4ade80";
    return "#16a34a";
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", paddingBottom: "100px" }}>
      
      {/* Hero Section */}
      <motion.section variants={heroVariants} initial="hidden" animate="visible" style={{ backgroundColor: "var(--card-bg)", border: "4px solid var(--border-color)", boxShadow: "var(--neo-shadow)", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", position: "relative" }}>
        <button style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-2)" }}>
          <Settings size={24} />
        </button>
        
        <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#FFE052", border: "4px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", marginBottom: "16px", boxShadow: "4px 4px 0 var(--border-color)", position: "relative" }}>
          <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>😎</span>
          <button style={{ position: "absolute", bottom: "0", right: "0", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--card-bg)", border: "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-1)" }}>
            <Edit2 size={16} />
          </button>
        </div>
        
        <h1 style={{ color: "var(--text-1)", fontSize: "2rem", fontWeight: 900, margin: "0 0 8px 0" }}>Học viên ENGRAM</h1>
        
        {rank && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: "#9C8EFA", color: "#111118", padding: "6px 16px", borderRadius: "20px", border: "2.5px solid var(--border-color)", fontWeight: 900, boxShadow: "2px 2px 0 var(--border-color)" }}>
              {rank.name}
            </div>
            <div style={{ color: "var(--text-2)", fontWeight: 800 }}>Cấp {rank.level}</div>
          </div>
        )}
        
        {rank && (
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 800, color: "var(--text-2)" }}>
              <span>{stats.xp} XP</span>
              <span>{rank.nextLevelXp} XP</span>
            </div>
            <div style={{ width: "100%", height: "20px", backgroundColor: "var(--bg-base)", border: "2.5px solid var(--border-color)", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (stats.xp / rank.nextLevelXp) * 100)}%`, height: "100%", backgroundColor: "#FF5964", borderRight: "2.5px solid var(--border-color)" }} />
            </div>
          </div>
        )}
      </motion.section>

      {/* 4 Stat Cards */}
      <motion.section variants={containerVariants} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { icon: BookOpen, label: "Từ đã học", value: stats.totalWords, color: "#4ECCD3" },
          { icon: Flame, label: "Chuỗi ngày", value: stats.streak, color: "#FF8E53" },
          { icon: Clock, label: "Ngày học", value: stats.daysStudied, color: "#9C8EFA" },
          { icon: Star, label: "Tổng XP", value: stats.xp, color: "#FFE052" }
        ].map((stat, i) => (
          <motion.div variants={cardVariants} whileHover={{ y: -4, boxShadow: "6px 6px 0 var(--border-color)" }} key={i} style={{ backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "16px", padding: "16px", boxShadow: "4px 4px 0 var(--border-color)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", transition: "box-shadow 0.08s ease" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: stat.color, border: "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <stat.icon size={20} color="#111118" />
            </div>
            <div>
              <div style={{ color: "var(--text-1)", fontSize: "1.8rem", fontWeight: 900, lineHeight: 1 }}><CountUpNumber value={stat.value} /></div>
              <div style={{ color: "var(--text-2)", fontSize: "0.9rem", fontWeight: 700, marginTop: "4px" }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Streak Calendar */}
      <section style={{ backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "16px", padding: "24px", boxShadow: "4px 4px 0 var(--border-color)", marginBottom: "32px" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarIcon /> Hoạt động 35 ngày qua
        </h2>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {heatmapDays.map((day, i) => (
            <motion.div 
              variants={fadeVariants}
              key={i} 
              title={day.date}
              style={{ 
                width: "18px", height: "18px", borderRadius: "4px", 
                backgroundColor: getIntensityColor(day.intensity),
                border: "1px solid var(--border-color)",
                opacity: day.intensity === 0 ? 0.3 : 1
              }} 
            />
          ))}
        </motion.div>
      </section>

      {/* Badges Grid */}
      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "16px" }}>Thành tựu</h2>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
          {BADGES.map((badge) => {
            const isUnlocked = gamification?.unlockedBadges.includes(badge.id);
            return (
              <motion.div 
                variants={cardVariants}
                whileHover={isUnlocked ? { scale: 1.05 } : {}}
                key={badge.id}
                title={badge.desc}
                style={{ 
                  backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", 
                  borderRadius: "16px", padding: "16px", display: "flex", flexDirection: "column", 
                  alignItems: "center", textAlign: "center",
                  boxShadow: isUnlocked ? "4px 4px 0 var(--border-color)" : "none",
                  opacity: isUnlocked ? 1 : 0.5,
                  filter: isUnlocked ? "none" : "grayscale(100%)",
                  position: "relative"
                }}
              >
                {!isUnlocked && (
                  <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                    <Lock size={16} color="var(--text-2)" />
                  </div>
                )}
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                  <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>{badge.emoji}</span>
                </div>
                <div style={{ color: "var(--text-1)", fontWeight: 800, fontSize: "0.9rem", lineHeight: 1.2 }}>{badge.name}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Charts */}
      <motion.section variants={fadeVariants} initial="hidden" animate="visible" style={{ backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "16px", padding: "24px", boxShadow: "4px 4px 0 var(--border-color)", marginBottom: "32px" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "24px" }}>Phân bố chủ đề</h2>
        <div style={{ width: "100%", height: "250px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="var(--text-2)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'var(--bg-base)' }}
                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '2.5px solid var(--border-color)', borderRadius: '8px', fontWeight: 'bold' }}
              />
              <Bar dataKey="words" fill="#9C8EFA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Settings */}
      <motion.section variants={fadeVariants} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "8px" }}>Cài đặt</h2>
        
        {mounted && (
          <button 
            onClick={toggle}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "12px", color: "var(--text-1)", fontWeight: 800, cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {isDark ? <Moon size={20} /> : <Sun size={20} />} Giao diện {isDark ? "Tối" : "Sáng"}
            </div>
            <div style={{ width: "40px", height: "24px", borderRadius: "12px", backgroundColor: isDark ? "#9C8EFA" : "var(--bg-base)", border: "2px solid var(--border-color)", position: "relative" }}>
              <div style={{ position: "absolute", top: "2px", left: isDark ? "18px" : "2px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: isDark ? "#111118" : "var(--text-2)", transition: "left 0.2s" }} />
            </div>
          </button>
        )}

        <button style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "12px", color: "var(--text-1)", fontWeight: 800, cursor: "pointer" }}>
          <Download size={20} /> Xuất dữ liệu
        </button>
        
        <button style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", borderRadius: "12px", color: "var(--text-1)", fontWeight: 800, cursor: "pointer" }}>
          <HelpCircle size={20} /> Hỗ trợ & Góp ý
        </button>
      </motion.section>

    </motion.div>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );
}
