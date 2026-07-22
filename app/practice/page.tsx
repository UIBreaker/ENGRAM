"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Shuffle, Image as ImageIcon, Keyboard, Target, Lock, ChevronRight } from "lucide-react";
import { getWords } from "@/lib/db";

const exercises = [
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
    desc: "Chọn đáp án đúng từ 4 lựa chọn. Đáp án nhiễu lấy từ kho từ của bạn.",
    minWords: 4,
    difficulty: "⭐ Dễ",
    diffColor: "#7B68EE",
  },
  {
    id: "matching",
    icon: Shuffle,
    color: "#2DD4BF",
    gradient: "linear-gradient(135deg,#2DD4BF,#38BDF8)",
    glow: "rgba(45,212,191,0.35)",
    bg: "rgba(45,212,191,0.08)",
    border: "rgba(45,212,191,0.22)",
    title: "Nối từ vựng",
    eng: "Word Matching",
    desc: "Nối từ tiếng Anh với nghĩa tiếng Việt. Luyện phản xạ nhận diện nhanh.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
    diffColor: "#2DD4BF",
  },
  {
    id: "image",
    icon: ImageIcon,
    color: "#E879A0",
    gradient: "linear-gradient(135deg,#E879A0,#F472B6)",
    glow: "rgba(232,121,160,0.35)",
    bg: "rgba(232,121,160,0.08)",
    border: "rgba(232,121,160,0.22)",
    title: "Nhận diện ảnh",
    eng: "Image Match",
    desc: "Xem hình ảnh và chọn từ tiếng Anh đúng. Học từ qua hình ảnh trực quan.",
    minWords: 4,
    difficulty: "⭐⭐ Vừa",
    diffColor: "#E879A0",
  },
  {
    id: "spelling",
    icon: Keyboard,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg,#F59E0B,#FBBF24)",
    glow: "rgba(245,158,11,0.35)",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.22)",
    title: "Gõ từ vựng",
    eng: "Spelling Challenge",
    desc: "Đọc nghĩa tiếng Việt hoặc nghe phát âm rồi gõ lại từ tiếng Anh chính xác.",
    minWords: 1,
    difficulty: "⭐⭐⭐ Khó",
    diffColor: "#F59E0B",
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>
            <Target size={20} color="#7B68EE" />
            Luyện tập từ vựng
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {loading ? "Đang tải..." : `Kho từ vựng: ${wordCount} từ`}
          </div>
        </div>
      </div>

      {/* Tip */}
      <div style={{
        padding: "12px 16px", borderRadius: "var(--r-md)", marginBottom: 20,
        background: "rgba(123,104,238,0.07)", border: "1px solid rgba(123,104,238,0.18)",
      }}>
        <div style={{ fontSize: 12, color: "#9B8FF5", fontWeight: 700, marginBottom: 3 }}>
          💡 Mẹo luyện tập
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.55 }}>
          Luyện theo thứ tự: Trắc nghiệm → Nối từ → Nhận diện ảnh → Gõ từ vựng để tăng dần độ khó.
        </div>
      </div>

      {/* Exercise cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {exercises.map((ex, i) => {
          const ok = wordCount >= ex.minWords;
          const Icon = ex.icon;
          return (
            <motion.div key={ex.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}>
              <Link href={ok ? `/practice/${ex.id}` : "#"} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "18px 14px",
                  borderRadius: "var(--r-lg)",
                  background: ok ? ex.bg : "var(--bg-raised)",
                  border: `1.5px solid ${ok ? ex.border : "var(--border)"}`,
                  cursor: ok ? "pointer" : "not-allowed",
                  opacity: ok ? 1 : 0.5,
                  minHeight: 168,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Icon */}
                  <div>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, marginBottom: 12,
                      background: ok ? ex.gradient : "rgba(255,255,255,0.05)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: ok ? `0 4px 16px ${ex.glow}` : "none",
                    }}>
                      {ok ? <Icon size={22} color="white" /> : <Lock size={18} color="var(--text-4)" />}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text-1)", marginBottom: 2 }}>
                      {ex.title}
                    </div>
                    <div style={{ fontSize: 10, color: ok ? ex.color : "var(--text-4)", fontWeight: 600, marginBottom: 7 }}>
                      {ex.eng}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
                      {ok ? ex.desc : `Cần ít nhất ${ex.minWords} từ để chơi`}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 8px",
                      borderRadius: 99, background: ok ? ex.bg : "rgba(255,255,255,0.04)",
                      color: ok ? ex.color : "var(--text-4)",
                      border: `1px solid ${ok ? ex.border : "transparent"}`,
                    }}>
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

      <style>{`a { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}
