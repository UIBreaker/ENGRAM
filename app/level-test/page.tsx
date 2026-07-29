"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ChevronRight, Clock, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { getGamificationState, saveGamificationState } from "@/lib/gamification";

const QUESTIONS = [
  { q: "What does 'Perseverance' mean?", options: ["Sự kiên trì", "Sự thất bại", "Sự tức giận", "Sự im lặng"], a: 0, level: "B1" },
  { q: "Choose the synonym of 'Eloquent':", options: ["Silent", "Articulate", "Confused", "Angry"], a: 1, level: "B2" },
  { q: "Fill: 'The ___ of the project was delayed.'", options: ["commence", "commencement", "commencing", "commenced"], a: 1, level: "B2" },
  { q: "'Ambiguous' means:", options: ["Clear", "Uncertain", "Beautiful", "Strong"], a: 1, level: "B1" },
  { q: "Opposite of 'Resilient':", options: ["Tough", "Fragile", "Strong", "Smart"], a: 1, level: "A2" },
  { q: "'Synergy' means:", options: ["Individual effort", "Combined force", "Competition", "Isolation"], a: 1, level: "B2" },
  { q: "'Algorithm' is used in:", options: ["Cooking", "Art", "Computer Science", "Music"], a: 2, level: "A2" },
  { q: "Fill: 'Please check the travel ___.'", options: ["itinerary", "summary", "diary", "calendar"], a: 0, level: "B1" },
  { q: "'Meticulous' means:", options: ["Careless", "Very careful", "Fast", "Slow"], a: 1, level: "C1" },
  { q: "Synonym of 'Abundant':", options: ["Scarce", "Plentiful", "Small", "Hidden"], a: 1, level: "B1" },
  { q: "'Ephemeral' means:", options: ["Permanent", "Short-lived", "Colorful", "Noisy"], a: 1, level: "C1" },
  { q: "Fill: 'She has an ___ personality.'", options: ["introvert", "introverted", "introverting", "introversion"], a: 1, level: "B2" },
  { q: "'Pragmatic' means:", options: ["Idealistic", "Practical", "Emotional", "Creative"], a: 1, level: "C1" },
  { q: "Opposite of 'Verbose':", options: ["Talkative", "Concise", "Loud", "Quiet"], a: 1, level: "C1" },
  { q: "'To procrastinate' means:", options: ["Plan ahead", "Delay tasks", "Work hard", "Finish early"], a: 1, level: "B1" },
  { q: "'Ubiquitous' means:", options: ["Rare", "Every everywhere", "Beautiful", "Ancient"], a: 1, level: "C1" },
  { q: "Fill: 'The report was ___.' (completed)", options: ["finalized", "finalizing", "to finalize", "finalize"], a: 0, level: "B1" },
  { q: "'Catalyst' in chemistry means:", options: ["Product", "Substance that speeds reaction", "Solvent", "Base"], a: 1, level: "B2" },
  { q: "'Benevolent' means:", options: ["Evil", "Kind", "Strong", "Wise"], a: 1, level: "B2" },
  { q: "'To mitigate' means:", options: ["Worsen", "Reduce/lessen", "Ignore", "Celebrate"], a: 1, level: "C1" },
];

const CEFR_LEVELS = [
  { level: "A1", desc: "Beginner", color: "#38E54D" },
  { level: "A2", desc: "Elementary", color: "#4ECCD3" },
  { level: "B1", desc: "Intermediate", color: "#FFE052" },
  { level: "B2", desc: "Upper Intermediate", color: "#FF8E53" },
  { level: "C1", desc: "Advanced", color: "#FF70A6" },
  { level: "C2", desc: "Proficient", color: "#FF5964" },
];

export default function LevelTestPage() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "results">("intro");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "quiz" && timeLeft > 0 && selectedOption === null) {
      timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && selectedOption === null) {
      handleNext(null); // Time out
    }
    return () => clearTimeout(timer);
  }, [phase, timeLeft, selectedOption]);

  const handleNext = (optionIndex: number | null) => {
    if (optionIndex !== null && optionIndex === QUESTIONS[currentQIndex].a) {
      setScore(s => s + 1);
    }
    
    if (currentQIndex < QUESTIONS.length - 1) {
      setCurrentQIndex(i => i + 1);
      setTimeLeft(15);
      setSelectedOption(null);
    } else {
      finishTest(score + (optionIndex !== null && optionIndex === QUESTIONS[currentQIndex].a ? 1 : 0));
    }
  };

  const finishTest = async (finalScore: number) => {
    setPhase("results");
    const xpReward = finalScore * 10;
    try {
      const state = await getGamificationState();
      state.xp += xpReward;
      await saveGamificationState(state);
    } catch (e) {
      console.error(e);
    }
  };

  const getResultLevel = () => {
    if (score <= 5) return CEFR_LEVELS[0];
    if (score <= 8) return CEFR_LEVELS[1];
    if (score <= 11) return CEFR_LEVELS[2];
    if (score <= 14) return CEFR_LEVELS[3];
    if (score <= 17) return CEFR_LEVELS[4];
    return CEFR_LEVELS[5];
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AnimatePresence mode="wait">
        
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            <ShieldAlert size={64} style={{ margin: "0 auto 1rem", color: "#9C8EFA" }} />
            <h1 style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "1rem" }}>Đánh giá trình độ</h1>
            <p style={{ fontSize: "1.2rem", color: "var(--text-2)", marginBottom: "3rem" }}>
              Làm bài test 20 câu để xác định trình độ từ vựng CEFR của bạn và nhận lộ trình học phù hợp.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
              {CEFR_LEVELS.map(level => (
                <div key={level.level} className="card" style={{ padding: "1rem", textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "900", color: level.color }}>{level.level}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>{level.desc}</div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ fontSize: "1.2rem", padding: "1rem 3rem", alignSelf: "center", backgroundColor: "#9C8EFA" }}
              onClick={() => {
                setPhase("quiz");
                setTimeLeft(15);
              }}
            >
              Bắt đầu Test <ChevronRight style={{ display: "inline" }} />
            </button>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Câu {currentQIndex + 1} / 20</div>
              <div style={{ 
                display: "flex", alignItems: "center", gap: "0.5rem", 
                fontSize: "1.2rem", fontWeight: "bold",
                color: timeLeft <= 5 ? "#FF5964" : "var(--text-1)"
              }}>
                <Clock /> {timeLeft}s
              </div>
            </div>
            
            <div style={{ width: "100%", height: "8px", backgroundColor: "var(--border-color)", borderRadius: "4px", marginBottom: "3rem", overflow: "hidden" }}>
              <motion.div 
                style={{ height: "100%", backgroundColor: "#38E54D" }} 
                initial={{ width: `${(currentQIndex / 20) * 100}%` }}
                animate={{ width: `${((currentQIndex + 1) / 20) * 100}%` }}
              />
            </div>

            <div className="card" style={{ padding: "3rem 2rem", marginBottom: "2rem", textAlign: "center", backgroundColor: "var(--card-bg)" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0 }}>{QUESTIONS[currentQIndex].q}</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {QUESTIONS[currentQIndex].options.map((opt, i) => (
                <button
                  key={i}
                  className="card"
                  onClick={() => {
                    setSelectedOption(i);
                    handleNext(i);
                  }}
                  style={{
                    padding: "1.5rem",
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: selectedOption === i ? "#9C8EFA" : "var(--card-bg)",
                    color: selectedOption === i ? "#fff" : "var(--text-1)",
                    transition: "transform 0.1s"
                  }}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
          >
            <Sparkles size={64} style={{ color: "#FFE052", marginBottom: "1rem" }} />
            <h2 style={{ fontSize: "2rem", fontWeight: "900", marginBottom: "1rem" }}>Hoàn thành!</h2>
            
            <div className="card" style={{ padding: "3rem", marginBottom: "2rem", backgroundColor: getResultLevel().color, width: "100%", maxWidth: "400px", color: "#111" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Trình độ của bạn:</div>
              <div style={{ fontSize: "5rem", fontWeight: "900", lineHeight: "1" }}>{getResultLevel().level}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginTop: "0.5rem" }}>{getResultLevel().desc}</div>
            </div>

            <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{score}/20</div>
                <div style={{ color: "var(--text-2)" }}>Câu đúng</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#38E54D" }}>+{score * 10}</div>
                <div style={{ color: "var(--text-2)" }}>XP Nhận được</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/">
                <button className="btn" style={{ fontSize: "1.1rem", padding: "1rem 2rem" }}>
                  Về Trang Chủ
                </button>
              </Link>
              <Link href="/vocabulary">
                <button className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrendingUp size={20} />
                  Xem kho từ vựng
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
