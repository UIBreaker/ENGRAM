"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shuffle, CheckCircle2, RotateCcw, Trophy, Timer } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

const PAIRS = 4; // pairs per round

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function pickRound(words: Word[]): Word[] {
  return shuffle(words).slice(0, Math.min(PAIRS, words.length));
}

type WrongState = { leftId: string; rightId: string } | null;

/* ── Round complete overlay ── */
function RoundDone({ round, elapsed, matched, onNext }: { round: number; elapsed: number; matched: number; onNext: () => void }) {
  const secs = (elapsed / 1000).toFixed(1);
  const rating = elapsed < 20000 ? "Siêu tốc ⚡" : elapsed < 40000 ? "Xuất sắc 🎉" : "Hoàn thành 💪";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 48 }}>✅</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)" }}>{rating}</div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 4 }}>
          Vòng {round} · {matched} cặp · {secs}s
        </div>
      </div>
      <button onClick={onNext} className="btn btn-primary" style={{ padding: "13px 32px" }}>
        Vòng tiếp theo →
      </button>
    </motion.div>
  );
}

export default function MatchingPage() {
  const [allWords,     setAllWords]    = useState<Word[]>([]);
  const [leftCol,      setLeftCol]     = useState<Word[]>([]);   // English words
  const [rightCol,     setRightCol]    = useState<Word[]>([]);   // same words, different order (show meaning)
  const [selLeft,      setSelLeft]     = useState<string | null>(null);
  const [matched,      setMatched]     = useState<Set<string>>(new Set());
  const [wrong,        setWrong]       = useState<WrongState>(null);
  const [round,        setRound]       = useState(1);
  const [roundDone,    setRoundDone]   = useState(false);
  const [totalMatched, setTotalMatch]  = useState(0);
  const [loading,      setLoading]     = useState(true);
  const [noWords,      setNoWords]     = useState(false);
  const startTime = useRef(Date.now());
  const [elapsed,      setElapsed]     = useState(0);

  const startRound = useCallback((words: Word[], r: number) => {
    const picked = pickRound(words);
    setLeftCol(shuffle(picked));
    setRightCol(shuffle(picked));
    setSelLeft(null); setMatched(new Set()); setWrong(null);
    setRound(r); setRoundDone(false);
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    getWords().then(ws => {
      setAllWords(ws);
      if (ws.length < 2) { setNoWords(true); setLoading(false); return; }
      startRound(ws, 1);
      setLoading(false);
    });
  }, [startRound]);

  /* tap left */
  const tapLeft = (id: string) => {
    if (matched.has(id) || wrong) return;
    setSelLeft(id === selLeft ? null : id);
  };

  /* tap right */
  const tapRight = (id: string) => {
    if (matched.has(id) || wrong || !selLeft) return;
    if (selLeft === id) {
      // correct!
      const next = new Set(matched); next.add(id);
      setMatched(next); setSelLeft(null);
      if (next.size === leftCol.length) {
        const ms = Date.now() - startTime.current;
        setElapsed(ms); setTotalMatch(t => t + next.size); setRoundDone(true);
      }
    } else {
      // wrong — flash red
      setWrong({ leftId: selLeft, rightId: id });
      setTimeout(() => { setWrong(null); setSelLeft(null); }, 700);
    }
  };

  const nextRound = () => startRound(allWords, round + 1);

  /* ── Loading ── */
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(45,212,191,0.3)", borderTopColor: "#2DD4BF", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (noWords) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100dvh", gap: 16 }}>
      <div style={{ fontSize: 48 }}>📭</div>
      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Chưa đủ từ vựng</div>
      <div style={{ fontSize: 14, color: "var(--text-3)" }}>Cần ít nhất 2 từ để chơi nối từ.</div>
      <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
    </div>
  );

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
            <Shuffle size={16} color="#2DD4BF" /> Nối từ vựng
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>Vòng {round} · {matched.size}/{leftCol.length} cặp</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.25)", fontSize: 13, fontWeight: 700, color: "#2DD4BF" }}>
          <Trophy size={13} /> {totalMatched}
        </div>
      </div>

      {/* Instruction */}
      <div style={{ fontSize: 12, color: "var(--text-4)", textAlign: "center", padding: "8px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "var(--r-sm)" }}>
        Bấm một từ ở cột trái → bấm nghĩa tương ứng ở cột phải
      </div>

      <AnimatePresence mode="wait">
        {roundDone ? (
          <RoundDone key="done" round={round} elapsed={elapsed} matched={totalMatched} onNext={nextRound} />
        ) : (
          <motion.div key={round} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1, alignContent: "start" }}>
            {/* Left column — English words */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", textAlign: "center", marginBottom: 4 }}>
                Tiếng Anh
              </div>
              {leftCol.map(w => {
                const isMatched = matched.has(w.id);
                const isSel     = selLeft === w.id;
                const isWrong   = wrong?.leftId === w.id;
                return (
                  <motion.button key={w.id} onClick={() => tapLeft(w.id)} whileTap={{ scale: 0.96 }}
                    disabled={isMatched}
                    style={{
                      padding: "14px 10px", borderRadius: "var(--r-md)", fontWeight: 700, fontSize: 14,
                      textAlign: "center", cursor: isMatched ? "default" : "pointer",
                      border: `1.5px solid ${isMatched ? "rgba(45,212,191,0.4)" : isWrong ? "rgba(251,113,133,0.5)" : isSel ? "rgba(123,104,238,0.6)" : "var(--border)"}`,
                      background: isMatched ? "rgba(45,212,191,0.1)" : isWrong ? "rgba(251,113,133,0.1)" : isSel ? "rgba(123,104,238,0.18)" : "var(--bg-raised)",
                      color: isMatched ? "#2DD4BF" : isWrong ? "#FB7185" : isSel ? "#9B8FF5" : "var(--text-1)",
                      transition: "all 0.15s", minHeight: 56, WebkitTapHighlightColor: "transparent",
                    }}>
                    {isMatched && <CheckCircle2 size={12} style={{ marginBottom: 4 }} />}
                    <div>{w.word}</div>
                    {w.phonetics && <div style={{ fontSize: 10, color: isMatched ? "#2DD4BF" : "var(--text-4)", marginTop: 2 }}>{w.phonetics}</div>}
                  </motion.button>
                );
              })}
            </div>

            {/* Right column — Vietnamese meanings */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-4)", textAlign: "center", marginBottom: 4 }}>
                Tiếng Việt
              </div>
              {rightCol.map(w => {
                const isMatched = matched.has(w.id);
                const isWrong   = wrong?.rightId === w.id;
                const isActive  = !!selLeft && !isMatched;
                return (
                  <motion.button key={w.id} onClick={() => tapRight(w.id)} whileTap={{ scale: 0.96 }}
                    disabled={isMatched || !selLeft}
                    style={{
                      padding: "14px 10px", borderRadius: "var(--r-md)", fontWeight: 600, fontSize: 13,
                      textAlign: "center", cursor: (isMatched || !selLeft) ? "default" : "pointer",
                      border: `1.5px solid ${isMatched ? "rgba(45,212,191,0.4)" : isWrong ? "rgba(251,113,133,0.5)" : isActive ? "rgba(45,212,191,0.25)" : "var(--border)"}`,
                      background: isMatched ? "rgba(45,212,191,0.1)" : isWrong ? "rgba(251,113,133,0.1)" : isActive ? "rgba(45,212,191,0.05)" : "var(--bg-raised)",
                      color: isMatched ? "#2DD4BF" : isWrong ? "#FB7185" : "var(--text-2)",
                      transition: "all 0.15s", minHeight: 56, lineHeight: 1.4,
                      WebkitTapHighlightColor: "transparent",
                    }}>
                    {isMatched && <CheckCircle2 size={12} style={{ marginBottom: 4 }} />}
                    {w.meaning}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
