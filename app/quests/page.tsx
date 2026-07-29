"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, popVariants, slideUpVariants } from "@/lib/animations";
import { getGamificationState, saveGamificationState } from "@/lib/gamification";
import { getStreak } from "@/lib/db";
import { Check, Flame, Star, BookOpen, Target, Zap, Trophy, Swords } from "lucide-react";

interface Quest {
  id: string;
  type: "daily" | "weekly";
  name: string;
  description: string;
  icon: React.ElementType;
  reward: number;
  target: number;
  current: number;
  isClaimed: boolean;
  color: string;
}

export default function QuestsPage() {
  const [gamification, setGamification] = useState<any>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function Skeleton({ w = '100%', h = 20, r = 8 }: { w?: number | string; h?: number; r?: number }) {
    return <div style={{ width: w, height: h, borderRadius: r, background: 'var(--card-bg)', overflow: 'hidden', border: '1.5px solid var(--border-color)' }}>
      <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }} />
    </div>;
  }

  useEffect(() => {
    const loadData = async () => {
      const gState = await getGamificationState();
      setGamification(gState);
      
      const streak = await getStreak();
      
      // Load or init quests
      const today = new Date().toISOString().split("T")[0];
      const savedQuestsStr = localStorage.getItem("engram_quests_v1");
      let savedQuests = savedQuestsStr ? JSON.parse(savedQuestsStr) : null;
      
      if (!savedQuests || savedQuests.date !== today) {
        // Init new quests
        savedQuests = {
          date: today,
          items: [
            { id: "q1", type: "daily", name: "Học từ mới", description: "Thêm 5 từ mới vào kho", icon: BookOpen, reward: 50, target: 5, current: 0, isClaimed: false, color: "#4ECCD3" },
            { id: "q2", type: "daily", name: "Ôn tập từ vựng", description: "Ôn tập 10 từ", icon: Star, reward: 80, target: 10, current: 0, isClaimed: false, color: "#FF8E53" },
            { id: "q3", type: "daily", name: "Chính xác 100%", description: "Đúng 5 flashcard liên tiếp", icon: Target, reward: 120, target: 5, current: 0, isClaimed: false, color: "#FF5964" },
            { id: "q4", type: "daily", name: "Ôn tập nhanh", description: "Hoàn thành phiên ôn 2 phút", icon: Zap, reward: 60, target: 1, current: 0, isClaimed: false, color: "#FFE052" },
            { id: "q5", type: "daily", name: "Đăng nhập hôm nay", description: "Mở app", icon: Star, reward: 20, target: 1, current: 1, isClaimed: false, color: "#9C8EFA" },
            { id: "q6", type: "daily", name: "Duy trì Streak", description: "Học 2 ngày liên tiếp", icon: Flame, reward: 100, target: 2, current: streak > 0 ? 2 : 1, isClaimed: false, color: "#FF70A6" },
            { id: "q7", type: "weekly", name: "Chinh phục tuần", description: "Học 7 ngày liên tiếp", icon: Trophy, reward: 500, target: 7, current: streak, isClaimed: false, color: "#FFE052" },
            { id: "q8", type: "weekly", name: "Đọc 5 stories", description: "Đọc 5 đoạn ngữ cảnh", icon: BookOpen, reward: 300, target: 5, current: 0, isClaimed: false, color: "#38E54D" },
            { id: "q9", type: "weekly", name: "Thắng 3 trận đấu", description: "Thắng 3 Duel", icon: Swords, reward: 400, target: 3, current: 0, isClaimed: false, color: "#FF5964" },
          ]
        };
        localStorage.setItem("engram_quests_v1", JSON.stringify(savedQuests));
      }
      
      // Update icons which are lost in JSON serialization
      const iconMap: Record<string, React.ElementType> = {
        q1: BookOpen, q2: Star, q3: Target, q4: Zap, q5: Star, q6: Flame, q7: Trophy, q8: BookOpen, q9: Swords
      };
      
      const mappedQuests = savedQuests.items.map((q: any) => ({ ...q, icon: iconMap[q.id] }));
      setQuests(mappedQuests);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const claimReward = async (id: string, reward: number) => {
    if (!gamification) return;
    
    // Update local state
    const updatedQuests = quests.map(q => q.id === id ? { ...q, isClaimed: true } : q);
    setQuests(updatedQuests);
    
    // Save to local storage
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("engram_quests_v1", JSON.stringify({
      date: today,
      items: updatedQuests
    }));
    
    // Update gamification
    const newState = { ...gamification, xp: gamification.xp + reward };
    setGamification(newState);
    await saveGamificationState(newState);

    setToast(`+${reward} XP`);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", paddingBottom: "100px", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Skeleton h={60} />
      <Skeleton h={100} />
      <Skeleton h={100} />
    </div>
  );

  const dailyQuests = quests.filter(q => q.type === "daily");
  const weeklyQuests = quests.filter(q => q.type === "weekly");

  const QuestCard = ({ quest }: { quest: Quest }) => {
    const isCompleted = quest.current >= quest.target;
    
    return (
      <motion.div 
        variants={cardVariants}
        style={{
          backgroundColor: "var(--card-bg)",
          border: "2.5px solid var(--border-color)",
          boxShadow: "var(--neo-shadow)",
          padding: "16px",
          borderRadius: "12px",
          opacity: quest.isClaimed ? 0.6 : 1,
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ 
              width: "48px", height: "48px", borderRadius: "12px", 
              backgroundColor: quest.color, border: "2px solid var(--border-color)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 2px 0 var(--border-color)"
            }}>
              <quest.icon size={24} color="#111118" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: "var(--text-1)", fontWeight: 800 }}>{quest.name}</h3>
              <p style={{ margin: 0, color: "var(--text-2)", fontSize: "0.9rem" }}>{quest.description}</p>
            </div>
          </div>
          <div style={{ 
            backgroundColor: "#FFE052", color: "#111118", fontWeight: 800,
            padding: "4px 8px", borderRadius: "8px", border: "2px solid var(--border-color)",
            boxShadow: "2px 2px 0 var(--border-color)", fontSize: "0.8rem",
            display: "flex", alignItems: "center", gap: "4px"
          }}>
            <Star size={12} fill="#111118" /> {quest.reward} XP
          </div>
        </div>
        
        <div style={{ width: "100%", height: "16px", backgroundColor: "var(--bg-base)", border: "2px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", position: "relative" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ 
              height: "100%", backgroundColor: quest.color,
              borderRight: quest.current > 0 ? "2px solid var(--border-color)" : "none",
            }} 
          />
          <span style={{ position: "absolute", width: "100%", textAlign: "center", top: -2, fontSize: "0.75rem", fontWeight: 800, color: "var(--text-1)", mixBlendMode: "difference" }}>
            {quest.current} / {quest.target}
          </span>
        </div>
        
        <button
          onClick={() => isCompleted && !quest.isClaimed ? claimReward(quest.id, quest.reward) : null}
          disabled={!isCompleted || quest.isClaimed}
          style={{
            backgroundColor: quest.isClaimed ? "var(--bg-base)" : isCompleted ? "#38E54D" : "var(--bg-base)",
            color: quest.isClaimed ? "var(--text-3)" : isCompleted ? "#111118" : "var(--text-3)",
            border: "2.5px solid var(--border-color)",
            boxShadow: quest.isClaimed || !isCompleted ? "none" : "2px 2px 0 var(--border-color)",
            padding: "10px",
            borderRadius: "8px",
            fontWeight: 800,
            cursor: isCompleted && !quest.isClaimed ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            transform: "translate(0, 0)",
            transition: "all 0.1s ease"
          }}
          onMouseDown={(e) => {
            if (isCompleted && !quest.isClaimed) {
              e.currentTarget.style.transform = "translate(2px, 2px)";
              e.currentTarget.style.boxShadow = "0px 0px 0 var(--border-color)";
            }
          }}
          onMouseUp={(e) => {
            if (isCompleted && !quest.isClaimed) {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "2px 2px 0 var(--border-color)";
            }
          }}
        >
          {quest.isClaimed ? <><motion.div variants={popVariants} initial="hidden" animate="visible"><Check size={18} /></motion.div> Đã nhận</> : isCompleted ? "Nhận thưởng" : "Chưa hoàn thành"}
        </button>
      </motion.div>
    );
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", paddingBottom: "100px", position: "relative" }}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#38E54D",
              color: "#111",
              padding: "12px 24px",
              borderRadius: "12px",
              fontWeight: 900,
              border: "3px solid var(--border-color)",
              boxShadow: "4px 4px 0px var(--border-color)",
              zIndex: 100,
              fontSize: "1.2rem"
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <header style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ color: "var(--text-2)", margin: "0 0 4px 0", fontWeight: 700 }}>
            {new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ color: "var(--text-1)", margin: 0, fontSize: "2rem", fontWeight: 900, textTransform: "uppercase" }}>
            Nhiệm vụ hôm nay
          </h1>
        </div>
        
        {gamification && (
          <div style={{ 
            backgroundColor: "#FFE052", color: "#111118", 
            border: "2.5px solid var(--border-color)", boxShadow: "var(--neo-shadow)",
            padding: "8px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 900
          }}>
            <Star size={20} fill="#111118" />
            {gamification.xp} XP
          </div>
        )}
      </header>

      <section style={{ marginBottom: "32px" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>⚡</span> Nhiệm vụ hằng ngày
        </h2>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {dailyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </motion.div>
      </section>

      <section>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>🔥</span> Nhiệm vụ tuần
        </h2>
        <motion.div 
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.055, delayChildren: 0.3 }
            }
          }} 
          initial="hidden" animate="visible" 
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {weeklyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}
