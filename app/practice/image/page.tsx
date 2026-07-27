"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";

const TOTAL = 10;
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

function buildQ(all: Word[]) {
  const word = all[Math.floor(Math.random() * all.length)];
  const imgSrc = word.imageUrl || `https://loremflickr.com/600/400/${encodeURIComponent(word.word)}`;
  const opts   = shuffle([word, ...shuffle(all.filter(w => w.id !== word.id)).slice(0, 3)]);
  return { word, imgSrc, opts };
}

type Question = ReturnType<typeof buildQ>;

function ScoreScreen({ score, onRestart }: { score: number; onRestart: () => void }) {
  const pct  = Math.round((score / TOTAL) * 100);
  const icon = pct >= 80 ? "🏆" : pct >= 60 ? "😊" : "💪";
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 900, color: "var(--text-1)" }}>{score}/{TOTAL} hình đúng</div>
        <div style={{ fontSize: 14, color: "var(--text-3)", marginTop: 4 }}>Độ chính xác: {pct}%</div>
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

export default function ImageMatchPage() {
  const [words,    setWords]   = useState<Word[]>([]);
  const [qIdx,     setQIdx]    = useState(0);
  const [q,        setQ]       = useState<Question | null>(null);
  const [selected, setSel]     = useState<string | null>(null);
  const [imgLoaded,setImgLoad] = useState(false);
  const [imgErr,   setImgErr]  = useState(false);
  const [score,    setScore]   = useState(0);
  const [phase,    setPhase]   = useState<"loading"|"playing"|"done">("loading");

  const start = useCallback(async () => {
    setPhase("loading");
    const ws = await getWords();
    setWords(ws);
    if (ws.length < 4) { setPhase("done"); return; }
    const first = buildQ(ws);
    setQ(first); setQIdx(0); setSel(null); setScore(0); setImgLoad(false); setImgErr(false);
    setPhase("playing");
  }, []);

  useEffect(() => { start(); }, [start]);

  const handleSelect = (opt: Word) => {
    if (selected !== null || !q) return;
    const correct = opt.id === q.word.id;
    setSel(opt.id);
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL) { setPhase("done"); return; }
      const nq = buildQ(words);
      setQ(nq); setQIdx(next); setSel(null); setImgLoad(false); setImgErr(false);
    }, 1300);
  };

  if (phase === "loading") return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(232,121,160,0.3)", borderTopColor: "#E879A0", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
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
          <ImageIcon size={16} color="#E879A0" /> Nhận diện ảnh
        </div>
      </div>
      {words.length < 4 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>😅</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Cần ít nhất 4 từ vựng!</div>
          <Link href="/vocabulary"><button className="btn btn-primary" style={{ padding: "12px 24px" }}>Thêm từ mới</button></Link>
        </div>
      ) : (
        <ScoreScreen score={score} onRestart={start} />
      )}
    </div>
  );

  if (!q) return null;

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", minHeight: "100dvh", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/practice" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, color: "var(--text-1)" }}>
            <ImageIcon size={16} color="#E879A0" /> Nhận diện ảnh
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{qIdx + 1}/{TOTAL} hình</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(232,121,160,0.1)", border: "1px solid rgba(232,121,160,0.25)", fontSize: 13, fontWeight: 700, color: "#E879A0" }}>
          <Trophy size={13} /> {score}
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <motion.div animate={{ width: `${(qIdx / TOTAL) * 100}%` }} transition={{ duration: 0.4 }}
          style={{ height: "100%", background: "linear-gradient(90deg,#E879A0,#F472B6)", borderRadius: 99 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }} style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

          {/* Image */}
          <div style={{ borderRadius: "var(--r-xl)", overflow: "hidden", border: "1px solid var(--border)", position: "relative", background: "var(--bg-raised)" }}>
            {!imgLoaded && !imgErr && (
              <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 28, height: 28, border: "3px solid rgba(232,121,160,0.3)", borderTopColor: "#E879A0", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              </div>
            )}
            {!imgErr && (
              <img src={q.imgSrc} alt="?" referrerPolicy="no-referrer" onLoad={() => setImgLoad(true)} onError={() => { setImgErr(true); setImgLoad(true); }}
                style={{ width: "100%", height: 220, objectFit: "cover", display: imgLoaded ? "block" : "none" }} />
            )}
            {imgErr && (
              <div style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-4)" }}>
                <ImageIcon size={36} />
                <span style={{ fontSize: 12 }}>Không tải được ảnh</span>
              </div>
            )}
            {/* Question overlay */}
            <div style={{ position: "absolute", top: 12, left: 12, right: 12 }}>
              <div style={{ background: "rgba(7,7,15,0.75)", backdropFilter: "blur(8px)", borderRadius: "var(--r-sm)", padding: "6px 12px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>
                🖼️ Từ tiếng Anh nào mô tả hình này?
              </div>
            </div>
          </div>

          {/* Options 2x2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {q.opts.map(opt => {
              const isSel   = selected === opt.id;
              const isRight = opt.id === q.word.id;
              const show    = selected !== null;
              let bg = "var(--bg-raised)", border = "var(--border)", color = "var(--text-1)";
              if (show && isRight)         { bg = "rgba(45,212,191,0.12)";  border = "rgba(45,212,191,0.5)";  color = "#2DD4BF"; }
              else if (show && isSel)      { bg = "rgba(251,113,133,0.12)"; border = "rgba(251,113,133,0.5)"; color = "#FB7185"; }
              return (
                <button key={opt.id} onClick={() => handleSelect(opt)} disabled={!!selected}
                  style={{
                    padding: "14px 10px", borderRadius: "var(--r-md)",
                    border: `1.5px solid ${border}`, background: bg, color,
                    fontWeight: 700, fontSize: 14, cursor: selected ? "default" : "pointer",
                    minHeight: 56, transition: "all 0.18s", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 4, WebkitTapHighlightColor: "transparent",
                  }}>
                  {show && isRight && <CheckCircle2 size={14} color="#2DD4BF" />}
                  {show && isSel && !isRight && <XCircle size={14} color="#FB7185" />}
                  <span>{opt.word}</span>
                  {opt.phonetics && <span style={{ fontSize: 10, opacity: 0.6 }}>{opt.phonetics}</span>}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
