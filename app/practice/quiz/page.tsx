"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckSquare, CheckCircle2, XCircle, Trophy, RotateCcw, Volume2 } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

const TOTAL = 10;

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

type Phase = "loading" | "playing" | "done";
type QMode = "m2w" | "w2m"; // meaning→word  or  word→meaning

interface Question { word: Word; options: Word[]; mode: QMode; }

function buildQuestion(all: Word[]): Question {
  const word = all[Math.floor(Math.random() * all.length)];
  const distractors = shuffle(all.filter(w => w.id !== word.id)).slice(0, 3);
  const options = shuffle([word, ...distractors]);
  const mode: QMode = Math.random() > 0.5 ? "m2w" : "w2m";
  return { word, options, mode };
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.85;
  speechSynthesis.speak(u);
}

/* ── Result screen ── */
function ResultScreen({ score, total, onRestart }: { score: number; total: number; onRestart: () => void }) {
  const pct = Math.round((score / total) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "💪" : "📚";
  const msg   = pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Khá tốt!" : "Cần luyện thêm!";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center", padding: "24px 0" }}>
      <div style={{
        width: 88, height: 88, borderRadius: "50%",
        background: "linear-gradient(135deg,#7B68EE,#E879A0)",
        boxShadow: "0 12px 40px rgba(123,104,238,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40,
      }}>{emoji}</div>

      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)" }}>{msg}</div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 4 }}>Bạn hoàn thành {total} câu trắc nghiệm</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: "100%", maxWidth: 300 }}>
        {[
          { label: "Đúng",      val: score,          c: "#2DD4BF" },
          { label: "Sai",       val: total - score,  c: "#FB7185" },
          { label: "Chính xác", val: `${pct}%`,      c: pct>=80?"#2DD4BF":pct>=60?"#F59E0B":"#FB7185" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "14px 8px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300 }}>
        <Link href="/practice" style={{ flex: 1, display: "block" }}>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "13px" }}>Bài khác</button>
        </Link>
        <button onClick={onRestart} className="btn btn-primary" style={{ flex: 1, padding: "13px" }}>
          <RotateCcw size={14} /> Chơi lại
        </button>
      </div>
    </motion.div>
  );
}

export default function QuizPage() {
  const [phase, setPhase]   = useState<Phase>("loading");
  const [words, setWords]   = useState<Word[]>([]);
  const [q, setQ]           = useState<Question | null>(null);
  const [qIdx, setQIdx]     = useState(0);
  const [selected, setSel]  = useState<string | null>(null);
  const [isCorrect, setOk]  = useState<boolean | null>(null);
  const [score, setScore]   = useState(0);

  const start = useCallback(async () => {
    setPhase("loading");
    const ws = await getWords();
    setWords(ws);
    if (ws.length < 4) { setPhase("done"); return; }
    setQ(buildQuestion(ws)); setQIdx(0); setSel(null); setOk(null); setScore(0);
    setPhase("playing");
  }, []);

  useEffect(() => { start(); }, [start]);

  const handleSelect = (opt: Word) => {
    if (selected !== null || !q) return;
    const correct = opt.id === q.word.id;
    setSel(opt.id); setOk(correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) { setPhase("done"); return; }
      setQIdx(next); setQ(buildQuestion(words)); setSel(null); setOk(null);
    }, 1300);
  };

  /* ── Loading ── */
  if (phase === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(123,104,238,0.3)", borderTopColor: "#7B68EE", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (phase === "done") return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      <Header current={qIdx} total={TOTAL} score={score} />
      {words.length < 4 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>😅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Chưa đủ từ vựng!</div>
          <div style={{ fontSize: 14, color: "var(--text-3)" }}>Cần ít nhất 4 từ để chơi trắc nghiệm.</div>
          <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
        </div>
      ) : (
        <ResultScreen score={score} total={TOTAL} onRestart={start} />
      )}
    </div>
  );

  if (!q) return null;

  /* ── Playing ── */
  const questionText = q.mode === "m2w" ? q.word.meaning : q.word.word;
  const questionSub  = q.mode === "m2w" ? "Chọn từ tiếng Anh đúng" : `${q.word.phonetics} — Chọn nghĩa tiếng Việt đúng`;
  const optText = (w: Word) => q.mode === "m2w" ? w.word : w.meaning;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh", gap: 20 }}>
      <Header current={qIdx} total={TOTAL} score={score} />

      {/* Progress */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div animate={{ width: `${((qIdx) / TOTAL) * 100}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: "linear-gradient(90deg,#7B68EE,#E879A0)", borderRadius: 99 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>

          {/* Question card */}
          <div style={{
            padding: "28px 24px", borderRadius: "var(--r-xl)",
            background: "linear-gradient(160deg,#16162E,#111124)",
            border: "1px solid rgba(123,104,238,0.18)",
            textAlign: "center", position: "relative",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", marginBottom: 12 }}>
              Câu {qIdx + 1} / {TOTAL}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)", marginBottom: 8, lineHeight: 1.3 }}>
              {questionText}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-4)" }}>{questionSub}</div>
            {q.mode === "w2m" && (
              <button onClick={() => speak(q.word.word)}
                style={{ marginTop: 12, background: "rgba(123,104,238,0.15)", border: "1px solid rgba(123,104,238,0.25)", borderRadius: "var(--r-sm)", padding: "6px 14px", cursor: "pointer", color: "#9B8FF5", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, WebkitTapHighlightColor: "transparent" }}>
                <Volume2 size={13} /> Phát âm
              </button>
            )}
          </div>

          {/* Options 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.options.map(opt => {
              const isSel   = selected === opt.id;
              const isRight = opt.id === q.word.id;
              const showRes = selected !== null;

              let bg = "var(--bg-raised)", border = "var(--border)", color = "var(--text-1)";
              if (showRes && isRight)         { bg = "rgba(45,212,191,0.12)";  border = "rgba(45,212,191,0.5)";  color = "#2DD4BF"; }
              else if (showRes && isSel)      { bg = "rgba(251,113,133,0.12)"; border = "rgba(251,113,133,0.5)"; color = "#FB7185"; }

              return (
                <button key={opt.id} onClick={() => handleSelect(opt)} disabled={selected !== null}
                  style={{
                    padding: "14px 12px", borderRadius: "var(--r-md)", border: `1.5px solid ${border}`,
                    background: bg, color, textAlign: "left", fontSize: 14, fontWeight: 600,
                    cursor: selected ? "default" : "pointer", minHeight: 60,
                    transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8,
                    WebkitTapHighlightColor: "transparent",
                  }}>
                  {showRes && isRight && <CheckCircle2 size={14} color="#2DD4BF" />}
                  {showRes && isSel && !isRight && <XCircle size={14} color="#FB7185" />}
                  <span style={{ lineHeight: 1.4 }}>{optText(opt)}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Header({ current, total, score }: { current: number; total: number; score: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Link href="/practice" style={{ textDecoration: "none" }}>
        <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
          <ArrowLeft size={17} color="var(--text-2)" />
        </button>
      </Link>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--text-1)" }}>
          <CheckSquare size={16} color="#7B68EE" /> Trắc nghiệm
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{current}/{total} câu</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "var(--teal-dim)", border: "1px solid rgba(45,212,191,0.25)", fontSize: 13, fontWeight: 700, color: "#2DD4BF" }}>
        <Trophy size={13} /> {score}
      </div>
    </div>
  );
}
