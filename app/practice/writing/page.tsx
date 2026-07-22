"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, PenTool, Sparkles, CheckCircle2, RefreshCw, ChevronRight, Award, BookOpen, AlertCircle } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

interface AIEvaluation {
  score: number; // 0-100
  wordsFound: string[];
  wordsMissing: string[];
  feedback: string;
  grammarNote: string;
  improvedVersion: string;
}

function evaluateWritingLocally(text: string, targetWords: Word[]): AIEvaluation {
  const cleanInput = text.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  targetWords.forEach(w => {
    if (cleanInput.includes(w.word.toLowerCase())) {
      found.push(w.word);
    } else {
      missing.push(w.word);
    }
  });

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  let baseScore = Math.round((found.length / targetWords.length) * 60);
  if (wordCount >= 15) baseScore += 20;
  else if (wordCount >= 8) baseScore += 10;
  if (sentenceCount >= 2) baseScore += 20;
  else if (sentenceCount >= 1) baseScore += 10;

  const score = Math.min(100, Math.max(30, baseScore));

  let feedback = "";
  if (missing.length === 0) {
    feedback = `Tuyệt vời! Bạn đã sử dụng đầy đủ cả ${found.length} từ vựng yêu cầu trong ngữ cảnh tự nhiên (${wordCount} từ, ${sentenceCount} câu).`;
  } else if (found.length > 0) {
    feedback = `Khá tốt! Bạn đã chèn được ${found.length}/${targetWords.length} từ. Hãy thử thêm từ "${missing.join(", ")}" vào bài viết nhé.`;
  } else {
    feedback = `Bạn chưa sử dụng các từ vựng được yêu cầu. Hãy viết 2-3 câu có chứa các từ bên trên!`;
  }

  let grammarNote = "Cấu trúc ngữ pháp tương đối rõ ràng. Hãy chú ý chia động từ và dùng từ nối (however, because, therefore) để đoạn văn trôi chảy hơn.";
  if (wordCount < 10) grammarNote = "Đoạn văn hơi ngắn. Hãy mở rộng thêm 1-2 câu để diễn đạt trọn vẹn ý tưởng của bạn.";

  // Create an improved suggested version
  const improvedVersion = text.trim() + (missing.length > 0 ? ` (Gợi ý thêm: ${missing.map(m => `Using ${m} will elevate your writing.`).join(" ")})` : "");

  return {
    score,
    wordsFound: found,
    wordsMissing: missing,
    feedback,
    grammarNote,
    improvedVersion,
  };
}

export default function AIWritingPracticePage() {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [targetWords, setTargetWords] = useState<Word[]>([]);
  const [text, setText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);
  const [loading, setLoading] = useState(true);

  const pickNewWords = useCallback((ws: Word[]) => {
    if (ws.length < 3) return;
    const picked = shuffle(ws).slice(0, 3);
    setTargetWords(picked);
    setText("");
    setEvaluation(null);
  }, []);

  useEffect(() => {
    getWords().then(ws => {
      setAllWords(ws);
      if (ws.length >= 3) pickNewWords(ws);
      setLoading(false);
    });
  }, [pickNewWords]);

  const handleCheck = async () => {
    if (!text.trim() || targetWords.length === 0) return;
    setEvaluating(true);

    // Simulate AI processing delay
    await new Promise(res => setTimeout(res, 1200));

    const result = evaluateWritingLocally(text, targetWords);
    setEvaluation(result);
    setEvaluating(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(232,121,160,0.3)", borderTopColor: "#E879A0", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (allWords.length < 3) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 16 }}>
      <div style={{ fontSize: 48 }}>✍️</div>
      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Chưa đủ từ vựng</div>
      <div style={{ fontSize: 14, color: "var(--text-3)" }}>Cần ít nhất 3 từ trong kho để chơi Luyện Viết cùng AI.</div>
      <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>
            <PenTool size={18} color="#E879A0" /> Luyện Viết cùng AI
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>Viết 2-3 câu chứa các từ chỉ định</div>
        </div>
        <button onClick={() => pickNewWords(allWords)} className="btn btn-ghost" style={{ padding: 8, title: "Đổi 3 từ khác" }}>
          <RefreshCw size={16} color="var(--text-3)" />
        </button>
      </div>

      {/* Target Words Pill Card */}
      <div style={{
        padding: "16px 18px", borderRadius: "var(--r-xl)",
        background: "linear-gradient(160deg,#2A1424,#1C0D18)",
        border: "1px solid rgba(232,121,160,0.25)",
        display: "flex", flexDirection: "column", gap: 10
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#E879A0", display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} /> 3 từ vựng cần sử dụng:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {targetWords.map(w => {
            const isUsed = text.toLowerCase().includes(w.word.toLowerCase());
            return (
              <div key={w.id} style={{
                padding: "6px 12px", borderRadius: 99,
                background: isUsed ? "rgba(45,212,191,0.18)" : "rgba(232,121,160,0.12)",
                border: `1px solid ${isUsed ? "rgba(45,212,191,0.4)" : "rgba(232,121,160,0.25)"}`,
                color: isUsed ? "#2DD4BF" : "#E879A0",
                fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s ease"
              }}>
                {isUsed && <CheckCircle2 size={13} />}
                <span>{w.word}</span>
                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>({w.meaning})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Writing Textarea */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Viết đoạn văn ngắn (2-3 câu tiếng Anh) kết hợp các từ trên..."
          className="input"
          style={{
            fontSize: 15, lineHeight: 1.6, minHeight: 140, borderRadius: "var(--r-lg)",
            padding: "16px"
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
          <span style={{ fontSize: 11, color: "var(--text-4)" }}>
            {text.trim().split(/\s+/).filter(Boolean).length} từ · {text.split(/[.!?]+/).filter(s => s.trim().length > 0).length} câu
          </span>

          <button onClick={handleCheck} disabled={!text.trim() || evaluating} className="btn btn-primary" style={{
            background: "linear-gradient(135deg,#E879A0,#F472B6)", boxShadow: "0 4px 20px rgba(232,121,160,0.35)",
            padding: "10px 20px"
          }}>
            {evaluating ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .6s linear infinite" }} />
                <span>AI đang chấm...</span>
              </div>
            ) : (
              <><Sparkles size={15} /> Chấm điểm AI</>
            )}
          </button>
        </div>
      </div>

      {/* AI Feedback Output Card */}
      <AnimatePresence>
        {evaluation && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{
            padding: "20px", borderRadius: "var(--r-xl)", background: "var(--bg-raised)",
            border: "1px solid var(--border-med)", display: "flex", flexDirection: "column", gap: 14
          }}>
            {/* Score header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={20} color="#E879A0" />
                <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>Kết Quả Đánh Giá AI</span>
              </div>
              <div style={{
                fontSize: 18, fontWeight: 900, padding: "4px 14px", borderRadius: 99,
                background: evaluation.score >= 80 ? "rgba(45,212,191,0.15)" : evaluation.score >= 60 ? "rgba(245,158,11,0.15)" : "rgba(251,113,133,0.15)",
                color: evaluation.score >= 80 ? "#2DD4BF" : evaluation.score >= 60 ? "#F59E0B" : "#FB7185",
                border: `1px solid ${evaluation.score >= 80 ? "rgba(45,212,191,0.3)" : evaluation.score >= 60 ? "rgba(245,158,11,0.3)" : "rgba(251,113,133,0.3)"}`
              }}>
                {evaluation.score}/100
              </div>
            </div>

            {/* General Feedback */}
            <div style={{ fontSize: 13, color: "var(--text-1)", lineHeight: 1.5, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <CheckCircle2 size={16} color="#2DD4BF" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{evaluation.feedback}</div>
            </div>

            {/* Grammar / Writing tip */}
            <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5, background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "var(--r-md)", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <AlertCircle size={15} color="#9B8FF5" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>{evaluation.grammarNote}</div>
            </div>

            {/* Next Action */}
            <button onClick={() => pickNewWords(allWords)} className="btn btn-secondary" style={{ width: "100%", padding: "11px", marginTop: 4 }}>
              Thử bộ 3 từ tiếp theo <ChevronRight size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
