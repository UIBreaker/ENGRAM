"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Shuffle, Image as ImageIcon, Keyboard, Target, Lock, ChevronRight, Headphones, PenTool, Sparkles } from "lucide-react";
import { getWords } from "@/lib/db";

const gameExercises = [
  {
    id: "quiz",
    icon: CheckSquare,
    bg: "#9C8EFA",
    title: "Trắc nghiệm",
    eng: "Multiple Choice Quiz",
    desc: "Chọn đáp án đúng từ 4 lựa chọn với các đáp án nhiễu từ kho từ.",
    minWords: 4,
    difficulty: "⭐ Dễ",
  },
  {
    id: "matching",
    icon: Shuffle,
    bg: "#4ECCD3",
    title: "Nối từ nhanh",
    eng: "Word Matching",
    desc: "Nối từ tiếng Anh với nghĩa tiếng Việt trong thời gian ngắn nhất.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
  },
  {
    id: "image",
    icon: ImageIcon,
    bg: "#FF5964",
    title: "Ghép ảnh chọn từ",
    eng: "Visual Association",
    desc: "Xem hình ảnh trực quan và chọn từ tiếng Anh tương ứng.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
  },
  {
    id: "spelling",
    icon: Keyboard,
    bg: "#FFE052",
    title: "Thử thách Gõ từ",
    eng: "Spelling Challenge",
    desc: "Xem nghĩa hoặc phát âm rồi gõ lại chính xác từ vựng.",
    minWords: 1,
    difficulty: "⭐⭐⭐ Khó",
  },
];

const skillExercises = [
  {
    id: "dictation",
    icon: Headphones,
    bg: "#38E54D",
    title: "Luyện Nghe & Chép chính tả",
    eng: "Dictation Practice",
    desc: "Nghe câu ví dụ mẫu của người bản xứ và chép lại hoàn chỉnh cả câu.",
    minWords: 1,
    difficulty: "🎧 Chép chính tả",
  },
  {
    id: "writing",
    icon: PenTool,
    bg: "#FF8E53",
    title: "Luyện Viết cùng AI",
    eng: "AI Contextual Writing",
    desc: "Viết 2-3 câu chứa 3-5 từ chỉ định và cho AI kiểm tra độ chuẩn & tự nhiên.",
    minWords: 3,
    difficulty: "✍️ AI Chấm điểm",
  },
];

export default function PracticePage() {
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWords().then(ws => { setWordCount(ws.length); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 18px" }}>
      {/* Header Card */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 24,
        background: "#FFFFFF", border: "2.5px solid #000000", borderRadius: 18,
        padding: "16px 18px", boxShadow: "4px 4px 0px #000000",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: 12 }}>
            <ArrowLeft size={18} color="#000000" strokeWidth={3} />
          </button>
        </Link>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 20, color: "#000000" }}>
            <Target size={22} color="#FF5964" strokeWidth={3} />
            Các Chế Độ Luyện Tập
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555555", marginTop: 2 }}>
            {loading ? "Đang tải..." : `Kho từ vựng: ${wordCount} từ · Chủ động chọn dạng bài`}
          </div>
        </div>
      </div>

      {/* Section 1: Skill Practice */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#000000", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.06em" }}>
          <Sparkles size={16} color="#FF5964" /> 2. TĂNG CƯỜNG KỸ NĂNG (NGHE & VIẾT AI)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {skillExercises.map((ex, i) => {
            const ok = wordCount >= ex.minWords;
            const Icon = ex.icon;
            return (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={ok ? `/practice/${ex.id}` : "#"} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "16px 18px", borderRadius: 16,
                    background: ok ? ex.bg : "#EFEFEF",
                    border: "2.5px solid #000000",
                    boxShadow: ok ? "4px 4px 0px #000000" : "2px 2px 0px #000000",
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.6,
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#FFFFFF", border: "2px solid #000000",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: "2px 2px 0px #000000",
                    }}>
                      <Icon size={22} color="#000000" strokeWidth={2.5} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>{ex.title}</div>
                        <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 99, background: "#FFFFFF", color: "#000000", border: "1.5px solid #000000", boxShadow: "1.5px 1.5px 0 #000" }}>
                          {ex.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2B2B", lineHeight: 1.4 }}>{ex.desc}</div>
                    </div>

                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "#FFFFFF", border: "2px solid #000000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "1.5px 1.5px 0 #000",
                    }}>
                      <ChevronRight size={16} color="#000000" strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Game-Based Practice */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#000000", marginBottom: 12, display: "flex", alignItems: "center", gap: 6, letterSpacing: "0.06em" }}>
          <Target size={16} color="#9C8EFA" /> 1. LUYỆN PHẢN XẠ TỪ VỰNG (GAME-BASED)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {gameExercises.map((ex, i) => {
            const ok = wordCount >= ex.minWords;
            const Icon = ex.icon;
            return (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={ok ? `/practice/${ex.id}` : "#"} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "16px 18px", borderRadius: 16,
                    background: ok ? ex.bg : "#EFEFEF",
                    border: "2.5px solid #000000",
                    boxShadow: ok ? "4px 4px 0px #000000" : "2px 2px 0px #000000",
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.6,
                    display: "flex", alignItems: "center", gap: 14,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#FFFFFF", border: "2px solid #000000",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: "2px 2px 0px #000000",
                    }}>
                      <Icon size={22} color="#000000" strokeWidth={2.5} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>{ex.title}</div>
                        <span style={{ fontSize: 11, fontWeight: 900, padding: "2px 8px", borderRadius: 99, background: "#FFFFFF", color: "#000000", border: "1.5px solid #000000", boxShadow: "1.5px 1.5px 0 #000" }}>
                          {ex.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2B2B", lineHeight: 1.4 }}>{ex.desc}</div>
                    </div>

                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "#FFFFFF", border: "2px solid #000000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "1.5px 1.5px 0 #000",
                    }}>
                      <ChevronRight size={16} color="#000000" strokeWidth={3} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
