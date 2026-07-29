"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWords } from "@/lib/db";
import { getGamificationState, saveGamificationState } from "@/lib/gamification";
import { Swords, Users, Target, Shield, Trophy, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

type Phase = "LOBBY" | "MATCHMAKING" | "COUNTDOWN" | "BATTLE" | "RESULTS";

interface Word {
  id: string;
  word: string;
  meaning: string;
}

export default function DuelPage() {
  const [phase, setPhase] = useState<Phase>("LOBBY");
  const [countdown, setCountdown] = useState(3);
  const [roundTimer, setRoundTimer] = useState(8);
  const [round, setRound] = useState(1);
  const [words, setWords] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentName, setOpponentName] = useState("");
  
  const [recentBattles] = useState([
    { id: 1, name: "ThanhTung99", result: "win", score: "8 - 5" },
    { id: 2, name: "LinhVu", result: "lose", score: "6 - 7" },
    { id: 3, name: "HuyNguyen", result: "win", score: "10 - 2" }
  ]);

  const names = ["Alex_99", "SarahDev", "ProGamer", "VocabMaster", "Ninja_23", "FastReader"];
  
  useEffect(() => {
    const loadData = async () => {
      const dbWords = await getWords();
      if (dbWords && dbWords.length >= 4) {
        setWords(dbWords);
      } else {
        setWords([
          { id: "1", word: "abandon", meaning: "từ bỏ" },
          { id: "2", word: "benefit", meaning: "lợi ích" },
          { id: "3", word: "candidate", meaning: "ứng cử viên" },
          { id: "4", word: "decade", meaning: "thập kỷ" },
          { id: "5", word: "economy", meaning: "kinh tế" },
          { id: "6", word: "feature", meaning: "tính năng" },
          { id: "7", word: "generate", meaning: "tạo ra" },
          { id: "8", word: "highlight", meaning: "làm nổi bật" },
          { id: "9", word: "identify", meaning: "nhận dạng" },
          { id: "10", word: "justify", meaning: "biện minh" }
        ]);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (phase === "MATCHMAKING") {
      const interval = setInterval(() => {
        setOpponentName(names[Math.floor(Math.random() * names.length)]);
      }, 200);
      
      setTimeout(() => {
        clearInterval(interval);
        setPhase("COUNTDOWN");
      }, 2500);
      
      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "COUNTDOWN") {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(t);
      } else {
        setPhase("BATTLE");
        startRound();
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    if (phase === "BATTLE") {
      if (roundTimer > 0) {
        const t = setTimeout(() => setRoundTimer(roundTimer - 1), 1000);
        return () => clearTimeout(t);
      } else {
        // Time's up
        handleAnswer("");
      }
    }
  }, [phase, roundTimer]);

  const startRound = () => {
    if (round > 10) {
      endBattle();
      return;
    }
    
    setRoundTimer(8);
    
    const word = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(word);
    
    // Generate options
    const wrongOptions = words
      .filter(w => w.id !== word.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(w => w.meaning);
      
    setOptions([...wrongOptions, word.meaning].sort(() => 0.5 - Math.random()));
  };

  const handleAnswer = (answer: string) => {
    if (!currentWord) return;
    
    const isCorrect = answer === currentWord.meaning;
    if (isCorrect) {
      setPlayerScore(prev => prev + 1);
    }
    
    // Opponent logic (randomly gets it right based on chance)
    if (Math.random() > 0.4) {
      setOpponentScore(prev => prev + 1);
    }
    
    // Next round
    setTimeout(() => {
      setRound(prev => prev + 1);
      startRound();
    }, 500);
  };

  const endBattle = async () => {
    setPhase("RESULTS");
    const gState = await getGamificationState();
    let xpGain = 30; // lose
    if (playerScore > opponentScore) xpGain = 150; // win
    else if (playerScore === opponentScore) xpGain = 75; // draw
    
    await saveGamificationState({
      ...gState,
      xp: gState.xp + xpGain
    });
  };

  const findMatch = () => {
    setPhase("MATCHMAKING");
    setPlayerScore(0);
    setOpponentScore(0);
    setRound(1);
    setCountdown(3);
  };

  if (phase === "LOBBY") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", paddingBottom: "100px", textAlign: "center" }}>
        <div style={{ display: "inline-block", backgroundColor: "#FF5964", padding: "16px", borderRadius: "50%", border: "4px solid var(--border-color)", boxShadow: "var(--neo-shadow)", marginBottom: "20px" }}>
          <Swords size={48} color="#111118" />
        </div>
        <h1 style={{ color: "var(--text-1)", fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", margin: "0 0 24px 0", textShadow: "4px 4px 0 var(--border-color)" }}>
          Thách Đấu
        </h1>
        
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "32px" }}>
          <div className="card" style={{ backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "2.5px solid var(--border-color)", boxShadow: "4px 4px 0 var(--border-color)", flex: 1 }}>
            <div style={{ color: "var(--text-2)", fontWeight: 700, fontSize: "0.9rem" }}>Tỉ lệ thắng</div>
            <div style={{ color: "#4ECCD3", fontSize: "2rem", fontWeight: 900 }}>68%</div>
          </div>
          <div className="card" style={{ backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "12px", border: "2.5px solid var(--border-color)", boxShadow: "4px 4px 0 var(--border-color)", flex: 1 }}>
            <div style={{ color: "var(--text-2)", fontWeight: 700, fontSize: "0.9rem" }}>Tổng trận</div>
            <div style={{ color: "#9C8EFA", fontSize: "2rem", fontWeight: 900 }}>42</div>
          </div>
        </div>

        <button 
          onClick={findMatch}
          style={{
            width: "100%", backgroundColor: "#FF5964", color: "#111118", 
            border: "4px solid var(--border-color)", boxShadow: "6px 6px 0 var(--border-color)",
            padding: "20px", borderRadius: "16px", fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase",
            cursor: "pointer", transition: "transform 0.1s", marginBottom: "32px"
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "translate(4px, 4px)"; e.currentTarget.style.boxShadow = "2px 2px 0 var(--border-color)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "6px 6px 0 var(--border-color)"; }}
        >
          Tìm trận ngẫu nhiên
        </button>
        
        <div style={{ textAlign: "left" }}>
          <h3 style={{ color: "var(--text-1)", fontWeight: 800, marginBottom: "16px" }}>Lịch sử đấu</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentBattles.map(battle => (
              <div key={battle.id} style={{ 
                backgroundColor: "var(--card-bg)", padding: "12px 16px", borderRadius: "12px", 
                border: "2px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", backgroundColor: battle.result === "win" ? "#38E54D" : "#FF5964", border: "2px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {battle.result === "win" ? <Trophy size={20} color="#111118" /> : <Shield size={20} color="#111118" />}
                  </div>
                  <span style={{ color: "var(--text-1)", fontWeight: 700 }}>vs {battle.name}</span>
                </div>
                <span style={{ fontWeight: 900, color: battle.result === "win" ? "#38E54D" : "#FF5964", fontSize: "1.2rem" }}>
                  {battle.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (phase === "MATCHMAKING") {
    return (
      <div style={{ height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ marginBottom: "24px" }}>
          <Target size={64} color="#FF5964" />
        </motion.div>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.5rem", marginBottom: "16px" }}>Đang tìm đối thủ...</h2>
        <div style={{ 
          padding: "16px", backgroundColor: "var(--card-bg)", border: "2.5px solid var(--border-color)", 
          borderRadius: "12px", width: "250px", textAlign: "center", boxShadow: "var(--neo-shadow)"
        }}>
          <span style={{ color: "var(--text-1)", fontWeight: 800, fontSize: "1.2rem" }}>{opponentName}</span>
        </div>
      </div>
    );
  }

  if (phase === "COUNTDOWN") {
    return (
      <div style={{ height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "2rem", marginBottom: "24px" }}>Sẵn sàng!</h2>
        <motion.div 
          key={countdown}
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}
          style={{ fontSize: "8rem", fontWeight: 900, color: "#FFE052", textShadow: "6px 6px 0 var(--border-color)", fontFamily: "sans-serif" }}
        >
          {countdown}
        </motion.div>
      </div>
    );
  }

  if (phase === "BATTLE" && currentWord) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", paddingBottom: "100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", backgroundColor: "var(--card-bg)", padding: "16px", borderRadius: "16px", border: "2.5px solid var(--border-color)", boxShadow: "var(--neo-shadow)" }}>
          <div style={{ textAlign: "center", width: "40%" }}>
            <div style={{ color: "var(--text-2)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>Bạn</div>
            <div style={{ color: "#38E54D", fontSize: "2.5rem", fontWeight: 900 }}>{playerScore}</div>
          </div>
          <div style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.5rem" }}>VS</div>
          <div style={{ textAlign: "center", width: "40%" }}>
            <div style={{ color: "var(--text-2)", fontWeight: 700, fontSize: "0.9rem", marginBottom: "4px" }}>{opponentName}</div>
            <div style={{ color: "#FF5964", fontSize: "2.5rem", fontWeight: 900 }}>{opponentScore}</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ color: "var(--text-2)", fontWeight: 800, marginBottom: "8px" }}>Vòng {round}/10</div>
          <div style={{ width: "100%", height: "16px", backgroundColor: "var(--bg-base)", border: "2px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
            <div style={{ width: `${(roundTimer / 8) * 100}%`, height: "100%", backgroundColor: roundTimer <= 3 ? "#FF5964" : "#4ECCD3", transition: "width 1s linear, background-color 0.3s" }} />
          </div>
          <h2 style={{ fontSize: "3rem", fontWeight: 900, color: "var(--text-1)", textTransform: "capitalize", wordBreak: "break-word" }}>
            {currentWord.word}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              style={{
                backgroundColor: "var(--card-bg)", color: "var(--text-1)", border: "2.5px solid var(--border-color)",
                boxShadow: "4px 4px 0 var(--border-color)", padding: "20px", borderRadius: "12px",
                fontSize: "1.1rem", fontWeight: 800, cursor: "pointer", transition: "transform 0.1s"
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "translate(4px, 4px)"; e.currentTarget.style.boxShadow = "0px 0px 0 var(--border-color)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0 var(--border-color)"; }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "RESULTS") {
    const isWin = playerScore > opponentScore;
    const isDraw = playerScore === opponentScore;
    const resultColor = isWin ? "#38E54D" : isDraw ? "#FFE052" : "#FF5964";
    const resultText = isWin ? "CHIẾN THẮNG" : isDraw ? "HÒA" : "THẤT BẠI";
    const emoji = isWin ? "🏆" : isDraw ? "🤝" : "💀";
    
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", textAlign: "center", paddingTop: "40px" }}>
        <div style={{ fontSize: "6rem", marginBottom: "20px" }}>
          <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>{emoji}</span>
        </div>
        <h1 style={{ color: resultColor, fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", margin: "0 0 24px 0", textShadow: "4px 4px 0 var(--border-color)" }}>
          {resultText}
        </h1>
        
        <div style={{ backgroundColor: "var(--card-bg)", padding: "32px", borderRadius: "16px", border: "4px solid var(--border-color)", boxShadow: "var(--neo-shadow)", marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ textAlign: "center", width: "40%" }}>
              <div style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "8px" }}>Bạn</div>
              <div style={{ color: "var(--text-1)", fontSize: "3rem", fontWeight: 900 }}>{playerScore}</div>
            </div>
            <div style={{ color: "var(--text-2)", fontWeight: 900, fontSize: "2rem" }}>-</div>
            <div style={{ textAlign: "center", width: "40%" }}>
              <div style={{ color: "var(--text-1)", fontWeight: 900, fontSize: "1.2rem", marginBottom: "8px" }}>{opponentName}</div>
              <div style={{ color: "var(--text-1)", fontSize: "3rem", fontWeight: 900 }}>{opponentScore}</div>
            </div>
          </div>
          
          <div style={{ backgroundColor: "var(--bg-base)", padding: "16px", borderRadius: "12px", border: "2px solid var(--border-color)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--text-1)", fontWeight: 800 }}>Phần thưởng:</span>
            <span style={{ color: "#FFE052", fontWeight: 900, fontSize: "1.2rem", textShadow: "1px 1px 0 #000" }}>
              +{isWin ? 150 : isDraw ? 75 : 30} XP
            </span>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "16px" }}>
          <button 
            onClick={() => setPhase("LOBBY")}
            style={{
              flex: 1, backgroundColor: "var(--bg-base)", color: "var(--text-1)", 
              border: "4px solid var(--border-color)", boxShadow: "4px 4px 0 var(--border-color)",
              padding: "16px", borderRadius: "12px", fontSize: "1.2rem", fontWeight: 900,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <Home size={24} /> Về sảnh
          </button>
          <button 
            onClick={findMatch}
            style={{
              flex: 2, backgroundColor: "#FF5964", color: "#111118", 
              border: "4px solid var(--border-color)", boxShadow: "4px 4px 0 var(--border-color)",
              padding: "16px", borderRadius: "12px", fontSize: "1.2rem", fontWeight: 900, textTransform: "uppercase",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}
          >
            <RotateCcw size={24} /> Tái đấu
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
