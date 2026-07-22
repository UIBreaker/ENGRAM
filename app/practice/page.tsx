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
    color: "#7B68EE",
    gradient: "linear-gradient(135deg,#7B68EE,#9B8FF5)",
    glow: "rgba(123,104,238,0.35)",
    bg: "rgba(123,104,238,0.08)",
    border: "rgba(123,104,238,0.22)",
    title: "Trắc nghiệm",
    eng: "Multiple Choice Quiz",
    desc: "Chọn đáp án đúng từ 4 lựa chọn với các đáp án nhiễu từ kho từ.",
    minWords: 4,
    difficulty: "⭐ Dễ",
  },
  {
    id: "matching",
    icon: Shuffle,
    color: "#2DD4BF",
    gradient: "linear-gradient(135deg,#2DD4BF,#38BDF8)",
    glow: "rgba(45,212,191,0.35)",
    bg: "rgba(45,212,191,0.08)",
    border: "rgba(45,212,191,0.22)",
    title: "Nối từ nhanh",
    eng: "Word Matching",
    desc: "Nối từ tiếng Anh với nghĩa tiếng Việt trong thời gian ngắn nhất.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
  },
  {
    id: "image",
    icon: ImageIcon,
    color: "#E879A0",
    gradient: "linear-gradient(135deg,#E879A0,#F472B6)",
    glow: "rgba(232,121,160,0.35)",
    bg: "rgba(232,121,160,0.08)",
    border: "rgba(232,121,160,0.22)",
    title: "Ghép ảnh chọn từ",
    eng: "Visual Association",
    desc: "Xem hình ảnh trực quan và chọn từ tiếng Anh tương ứng.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
  },
  {
    id: "spelling",
    icon: Keyboard,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg,#F59E0B,#FBBF24)",
    glow: "rgba(245,158,11,0.35)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
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
    color: "#38BDF8",
    gradient: "linear-gradient(135deg,#38BDF8,#818CF8)",
    glow: "rgba(56,189,248,0.35)",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.22)",
    title: "Luyện Nghe & Chép chính tả",
    eng: "Dictation Practice",
    desc: "Nghe câu ví dụ mẫu của người bản xứ và chép lại hoàn chỉnh cả câu.",
    minWords: 1,
    difficulty: "🎧 Chép chính tả",
  },
  {
    id: "writing",
    icon: PenTool,
    color: "#F472B6",
    gradient: "linear-gradient(135deg,#E879A0,#F472B6)",
    glow: "rgba(244,114,182,0.35)",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
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
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>
            <Target size={20} color="#7B68EE" />
            Các Chế Độ Luyện Tập
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {loading ? "Đang tải..." : `Kho từ vựng: ${wordCount} từ · Chủ động chọn dạng bài`}
          </div>
        </div>
      </div>

      {/* Section 1: Skill Practice (Dictation & AI Writing) */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#38BDF8", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={14} /> 2. Tăng Cường Kỹ Năng (Nghe & Viết AI)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {skillExercises.map((ex, i) => {
            const ok = wordCount >= ex.minWords;
            const Icon = ex.icon;
            return (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Link href={ok ? `/practice/${ex.id}` : "#"} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "16px 16px", borderRadius: "var(--r-lg)",
                    background: ok ? ex.bg : "var(--bg-raised)",
                    border: `1.5px solid ${ok ? ex.border : "var(--border)"}`,
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.5,
                    display: "flex", alignItems: "center", gap: 14,
                    WebkitTapHighlightColor: "transparent"
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 14,
                      background: ok ? ex.gradient : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: ok ? `0 4px 16px ${ex.glow}` : "none"
                    }}>
                      <Icon size={22} color="white" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)" }}>{ex.title}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: ex.bg, color: ex.color, border: `1px solid ${ex.border}` }}>
                          {ex.difficulty}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{ex.desc}</div>
                    </div>

                    <ChevronRight size={16} color={ex.color} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Game-Based Practice */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7B68EE", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Target size={14} /> 1. Luyện Phản Xạ Từ Vựng (Game-Based)
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {gameExercises.map((ex, i) => {
            const ok = wordCount >= ex.minWords;
            const Icon = ex.icon;
            return (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                <Link href={ok ? `/practice/${ex.id}` : "#"} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "16px 14px", borderRadius: "var(--r-lg)",
                    background: ok ? ex.bg : "var(--bg-raised)",
                    border: `1.5px solid ${ok ? ex.border : "var(--border)"}`,
                    cursor: ok ? "pointer" : "not-allowed",
                    opacity: ok ? 1 : 0.5,
                    minHeight: 160,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                    <div>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, marginBottom: 10,
                        background: ok ? ex.gradient : "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: ok ? `0 4px 16px ${ex.glow}` : "none",
                      }}>
                        {ok ? <Icon size={20} color="white" /> : <Lock size={16} color="var(--text-4)" />}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)", marginBottom: 2 }}>{ex.title}</div>
                      <div style={{ fontSize: 10, color: ok ? ex.color : "var(--text-4)", fontWeight: 600, marginBottom: 6 }}>{ex.eng}</div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{ex.desc}</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: ok ? ex.bg : "rgba(255,255,255,0.04)", color: ok ? ex.color : "var(--text-4)", border: `1px solid ${ok ? ex.border : "transparent"}` }}>
                        {ex.difficulty}
                      </span>
                      {ok && <ChevronRight size={14} color={ex.color} />}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`a { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
