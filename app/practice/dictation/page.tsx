"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Headphones, Volume2, Lightbulb, RotateCcw, Trophy, CheckCircle2, XCircle, ChevronRight, Play } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

const TOTAL = 8;

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function speak(text: string, rate = 0.85) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  speechSynthesis.speak(u);
}

function cleanText(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?'"–-]/g, "");
}

/* ── Result screen ── */
function ResultScreen({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🎧" : pct >= 50 ? "💪" : "👂";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontSize: 56 }}>{emoji}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)" }}>
          {pct >= 80 ? "Tai nghe siêu đẳng!" : pct >= 50 ? "Luyện nghe khá tốt!" : "Cần luyện nghe thêm!"}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 4 }}>Chép chính tả đúng {score}/{total} câu · {pct}%</div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
        <Link href="/practice" style={{ flex: 1, display: "block" }}>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "13px" }}>Bài khác</button>
        </Link>
        <button onClick={onRestart} className="btn btn-primary" style={{ flex: 1, padding: "13px" }}>
          <RotateCcw size={14} /> Thử lại
        </button>
      </div>
    </motion.div>
  );
}

export default function DictationPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [queue, setQueue] = useState<Word[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<"loading" | "playing" | "done">("loading");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const start = useCallback(async () => {
    setPhase("loading");
    const ws = await getWords();
    setWords(ws);
    if (ws.length === 0) { setPhase("done"); return; }
    // Pick words that have example sentences, or fallback to word
    const q = shuffle(ws).slice(0, TOTAL);
    setQueue(q); setQIdx(0); setInput(""); setShowHint(false); setResult(null); setScore(0);
    setPhase("playing");
    setTimeout(() => {
      inputRef.current?.focus();
      if (q[0]) speak(q[0].example || q[0].word);
    }, 300);
  }, []);

  useEffect(() => { start(); }, [start]);

  const currentWord = queue[qIdx];
  const targetSentence = currentWord ? (currentWord.example || currentWord.word) : "";

  const handlePlay = (slow = false) => {
    if (targetSentence) speak(targetSentence, slow ? 0.6 : 0.85);
  };

  const handleSubmit = () => {
    if (!currentWord || result !== null) return;
    const userClean = cleanText(input);
    const targetClean = cleanText(targetSentence);

    // Exact or loose match (>=80% words match)
    const targetWords = targetClean.split(/\s+/);
    const userWords = userClean.split(/\s+/);
    let matched = 0;
    targetWords.forEach(w => { if (userWords.includes(w)) matched++; });
    const matchPct = targetWords.length > 0 ? matched / targetWords.length : 0;

    const isCorrect = userClean === targetClean || matchPct >= 0.8;
    setResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= queue.length) { setPhase("done"); return; }
      setQIdx(next); setInput(""); setShowHint(false); setResult(null);
      setTimeout(() => {
        inputRef.current?.focus();
        if (queue[next]) speak(queue[next].example || queue[next].word);
      }, 300);
    }, 2200);
  };

  if (phase === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(56,189,248,0.3)", borderTopColor: "#38BDF8", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (phase === "done") return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
          <Headphones size={16} color="#38BDF8" /> Luyện nghe & Chép chính tả
        </div>
      </div>
      {words.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>😅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Chưa có từ vựng!</div>
          <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
        </div>
      ) : (
        <ResultScreen score={score} total={queue.length} onRestart={start} />
      )}
    </div>
  );

  if (!currentWord) return null;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--text-1)" }}>
            <Headphones size={16} color="#38BDF8" /> Chép chính tả
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>Câu {qIdx + 1}/{queue.length}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)", fontSize: 13, fontWeight: 700, color: "#38BDF8" }}>
          <Trophy size={13} /> {score}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div animate={{ width: `${(qIdx / queue.length) * 100}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: "linear-gradient(90deg,#38BDF8,#818CF8)", borderRadius: 99 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

          {/* Audio Player Card */}
          <div style={{
            padding: "24px 20px", borderRadius: "var(--r-xl)",
            background: "linear-gradient(160deg,#0E1E2E,#0A1524)",
            border: "1px solid rgba(56,189,248,0.2)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center"
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              Từ mục tiêu: <span style={{ color: "#38BDF8", fontFamily: "monospace", letterSpacing: "0.15em", fontSize: 13 }}>
                {showHint || result !== null ? currentWord.word : currentWord.word.split('').map(() => '_').join(' ')}
              </span> ({currentWord.meaning})
            </div>

            {/* Audio buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => handlePlay(false)} style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "linear-gradient(135deg,#38BDF8,#818CF8)",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 6px 20px rgba(56,189,248,0.4)", WebkitTapHighlightColor: "transparent"
              }}>
                <Volume2 size={28} color="white" />
              </button>

              <button onClick={() => handlePlay(true)} style={{
                padding: "8px 14px", borderRadius: "var(--r-sm)",
                background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)",
                cursor: "pointer", color: "#38BDF8", fontSize: 12, fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: 5, WebkitTapHighlightColor: "transparent"
              }}>
                🐌 Phá âm chậm
              </button>
            </div>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Nghe âm thanh và gõ lại toàn bộ câu tiếng Anh
            </div>

            {/* Hint */}
            {showHint ? (
              <div style={{ fontSize: 13, color: "#F59E0B", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", padding: "6px 12px", borderRadius: 8 }}>
                💡 Gợi ý (từ chứa): <strong>{currentWord.word}</strong>
              </div>
            ) : (
              <button onClick={() => setShowHint(true)} style={{ background: "none", border: "none", color: "var(--text-4)", fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Lightbulb size={12} /> Hiện gợi ý
              </button>
            )}
          </div>

          {/* Textarea Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => { if (result === null) setInput(e.target.value); }}
              placeholder="Gõ lại câu tiếng Anh vừa nghe được..."
              disabled={result !== null}
              className="input"
              style={{
                fontSize: 16, lineHeight: 1.5, minHeight: 90, borderRadius: "var(--r-md)",
                borderColor: result === "correct" ? "rgba(45,212,191,0.6)" : result === "wrong" ? "rgba(251,113,133,0.6)" : undefined,
                background: result === "correct" ? "rgba(45,212,191,0.06)" : result === "wrong" ? "rgba(251,113,133,0.06)" : undefined,
              }}
            />

            {/* Feedback */}
            <AnimatePresence>
              {result !== null && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "12px 14px", borderRadius: "var(--r-md)", textAlign: "center",
                    background: result === "correct" ? "rgba(45,212,191,0.08)" : "rgba(251,113,133,0.08)",
                    border: `1px solid ${result === "correct" ? "rgba(45,212,191,0.3)" : "rgba(251,113,133,0.3)"}`,
                    display: "flex", flexDirection: "column", gap: 4, alignItems: "center"
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: result === "correct" ? "#2DD4BF" : "#FB7185", fontSize: 14 }}>
                    {result === "correct" ? <><CheckCircle2 size={16} /> Chính xác! ✨</> : <><XCircle size={16} /> Câu gốc chuẩn:</>}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-1)", fontStyle: "italic" }}>
                    &ldquo;{targetSentence}&rdquo;
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {result === null && (
              <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: "14px", fontSize: 15, background: "linear-gradient(135deg,#38BDF8,#818CF8)", boxShadow: "0 4px 20px rgba(56,189,248,0.35)" }}>
                Kiểm tra câu chép <ChevronRight size={16} />
              </button>
            )}
          </div>

        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
