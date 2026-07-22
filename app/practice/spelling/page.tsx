"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Keyboard, Volume2, Lightbulb, RotateCcw, Trophy, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

const TOTAL = 10;

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.8;
  speechSynthesis.speak(u);
}

function getHintText(word: string, level: 0 | 1 | 2): string {
  if (level === 0) return "";
  if (level === 1) return word.split("").map(() => "_").join(" "); // _ _ _ _ _
  return word[0].toUpperCase() + word.slice(1).split("").map(() => "_").join(" "); // A _ _ _ _
}

function normalise(s: string) { return s.trim().toLowerCase(); }

/* ── Score screen ── */
function ScoreScreen({ correct, total, onRestart }: { correct: number; total: number; onRestart: () => void }) {
  const pct  = Math.round((correct / total) * 100);
  const icon = pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "📚";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)" }}>
          {pct >= 80 ? "Xuất sắc!" : pct >= 50 ? "Khá tốt!" : "Tiếp tục cố gắng!"}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 4 }}>Gõ đúng {correct}/{total} từ · {pct}%</div>
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

export default function SpellingPage() {
  const [words,   setWords]   = useState<Word[]>([]);
  const [queue,   setQueue]   = useState<Word[]>([]);
  const [qIdx,    setQIdx]    = useState(0);
  const [input,   setInput]   = useState("");
  const [hint,    setHint]    = useState<0|1|2>(0);
  const [result,  setResult]  = useState<"correct"|"wrong"|null>(null);
  const [score,   setScore]   = useState(0);
  const [phase,   setPhase]   = useState<"loading"|"playing"|"done">("loading");
  const inputRef = useRef<HTMLInputElement>(null);

  const start = useCallback(async () => {
    setPhase("loading");
    const ws = await getWords();
    setWords(ws);
    if (ws.length === 0) { setPhase("done"); return; }
    const q = shuffle(ws).slice(0, TOTAL);
    setQueue(q); setQIdx(0); setInput(""); setHint(0); setResult(null); setScore(0);
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  useEffect(() => { start(); }, [start]);

  const currentWord = queue[qIdx];

  const handleSubmit = () => {
    if (!currentWord || result !== null) return;
    const correct = normalise(input) === normalise(currentWord.word);
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= queue.length) { setPhase("done"); return; }
      setQIdx(next); setInput(""); setHint(0); setResult(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, 1800);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const nextHint = () => {
    if (hint < 2) setHint(h => (h + 1) as 0|1|2);
  };

  /* Loading */
  if (phase === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(245,158,11,0.3)", borderTopColor: "#F59E0B", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
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
          <Keyboard size={16} color="#F59E0B" /> Gõ từ vựng
        </div>
      </div>
      {words.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>😅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Chưa có từ vựng nào!</div>
          <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
        </div>
      ) : (
        <ScoreScreen correct={score} total={queue.length} onRestart={start} />
      )}
    </div>
  );

  if (!currentWord) return null;

  const hintText = getHintText(currentWord.word, hint);
  const isCorrect = result === "correct";
  const isWrong   = result === "wrong";

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--text-1)" }}>
            <Keyboard size={16} color="#F59E0B" /> Gõ từ vựng
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{qIdx + 1}/{queue.length} từ</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>
          <Trophy size={13} /> {score}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div animate={{ width: `${(qIdx / queue.length) * 100}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: "linear-gradient(90deg,#F59E0B,#FBBF24)", borderRadius: 99 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Question card */}
          <div style={{
            padding: "28px 24px", borderRadius: "var(--r-xl)",
            background: "linear-gradient(160deg,#1C1A12,#111110)",
            border: "1px solid rgba(245,158,11,0.18)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 10 }}>
              Nghĩa tiếng Việt
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-1)", lineHeight: 1.35, marginBottom: 12 }}>
              {currentWord.meaning}
            </div>
            {currentWord.example && (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontStyle: "italic", lineHeight: 1.55 }}>
                &ldquo;{currentWord.example}&rdquo;
              </div>
            )}

            {/* Buttons row */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              <button onClick={() => speak(currentWord.word)}
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "var(--r-sm)", padding: "7px 14px", cursor: "pointer", color: "#F59E0B", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, WebkitTapHighlightColor: "transparent" }}>
                <Volume2 size={13} /> Phát âm
              </button>
              {hint < 2 && (
                <button onClick={nextHint}
                  style={{ background: "rgba(155,143,245,0.1)", border: "1px solid rgba(155,143,245,0.2)", borderRadius: "var(--r-sm)", padding: "7px 14px", cursor: "pointer", color: "#9B8FF5", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, WebkitTapHighlightColor: "transparent" }}>
                  <Lightbulb size={13} /> Gợi ý {hint === 0 ? "(độ dài)" : "(chữ đầu)"}
                </button>
              )}
            </div>

            {/* Hint display */}
            {hint > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 14, fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "#9B8FF5", fontFamily: "monospace" }}>
                {hintText}
              </motion.div>
            )}
          </div>

          {/* Input area */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => { if (result === null) setInput(e.target.value); }}
                onKeyDown={handleKey}
                placeholder="Gõ từ tiếng Anh..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                disabled={result !== null}
                className="input"
                style={{
                  fontSize: 18, fontWeight: 700, textAlign: "center", padding: "16px",
                  letterSpacing: "0.05em", borderRadius: "var(--r-md)",
                  borderColor: isCorrect ? "rgba(45,212,191,0.6)" : isWrong ? "rgba(251,113,133,0.6)" : undefined,
                  background: isCorrect ? "rgba(45,212,191,0.06)" : isWrong ? "rgba(251,113,133,0.06)" : undefined,
                  boxShadow: isCorrect ? "0 0 0 3px rgba(45,212,191,0.12)" : isWrong ? "0 0 0 3px rgba(251,113,133,0.12)" : undefined,
                }}
              />
            </div>

            {/* Result feedback */}
            <AnimatePresence>
              {result !== null && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: "14px 16px", borderRadius: "var(--r-md)", textAlign: "center",
                    background: isCorrect ? "rgba(45,212,191,0.08)" : "rgba(251,113,133,0.08)",
                    border: `1px solid ${isCorrect ? "rgba(45,212,191,0.3)" : "rgba(251,113,133,0.3)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                  {isCorrect
                    ? <><CheckCircle2 size={18} color="#2DD4BF" /><span style={{ fontWeight: 700, color: "#2DD4BF", fontSize: 15 }}>Chính xác! ✨</span></>
                    : <><XCircle size={18} color="#FB7185" /><span style={{ fontWeight: 700, color: "#FB7185", fontSize: 15 }}>Đáp án đúng: <span style={{ fontStyle: "italic" }}>{currentWord.word}</span></span></>
                  }
                </motion.div>
              )}
            </AnimatePresence>

            {result === null && (
              <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: "14px", fontSize: 15 }}>
                Kiểm tra <ChevronRight size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
