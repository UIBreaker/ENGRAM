"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle2, ArrowLeft, Trophy, RotateCcw, Volume2, ChevronRight, Zap, ShieldAlert, Timer, Sparkles } from "lucide-react";
import { getWords, getDueWords, applyRating, updateWord, recordSession } from "@/lib/db";
import { Word, FlashcardRating, TopicTag, TOPIC_TAGS, TOPIC_EMOJI } from "@/lib/types";
import Link from "next/link";

/* ── Progress ── */
function Progress({ cur, tot }: { cur: number; tot: number }) {
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
      <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#7B68EE,#E879A0)", borderRadius: 99 }}
        initial={{ width: 0 }}
        animate={{ width: `${tot > 0 ? (cur / tot) * 100 : 0}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }} />
    </div>
  );
}

/* ── Card Front ── */
function CardFront({ word }: { word: Word }) {
  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(160deg, #16162E 0%, #111124 100%)",
      border: "1px solid rgba(123,104,238,0.22)",
      borderRadius: "var(--r-xl)",
      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "70%", height: "50%", background: "radial-gradient(ellipse, rgba(123,104,238,0.18) 0%, transparent 70%)" }} />

      <div style={{ width: 48, height: 48, borderRadius: 16, background: "rgba(123,104,238,0.15)", border: "1px solid rgba(123,104,238,0.25)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <BrainCircuit size={24} color="#9B8FF5" />
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: "var(--text-1)", textAlign: "center", letterSpacing: "-0.01em", lineHeight: 1.15, marginBottom: 8 }}>
        {word.word}
      </div>
      <div style={{ fontSize: 15, color: "var(--text-3)", fontFamily: "monospace" }}>
        {word.phonetics}
      </div>
      <div style={{ position: "absolute", bottom: 20, display: "flex", alignItems: "center", gap: 6, color: "var(--text-4)", fontSize: 12 }}>
        Chạm để xem nghĩa <ChevronRight size={13} />
      </div>
    </div>
  );
}

/* ── Card Back ── */
function CardBack({ word }: { word: Word }) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    if (word.imageUrl) {
      setImgSrc(word.imageUrl);
    } else {
      // Use LoremFlickr / Picsum for high quality reliable image fallback
      setImgSrc(`https://loremflickr.com/600/360/${encodeURIComponent(word.word)}`);
    }
  }, [word.id, word.imageUrl, word.word]);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.word);
    u.lang = "en-US"; u.rate = 0.85;
    speechSynthesis.speak(u);
  };

  const showImage = imgSrc && !imgFailed;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(160deg, #1B1535 0%, #140F2E 100%)",
      border: "1px solid rgba(155,143,245,0.28)",
      borderRadius: "var(--r-xl)",
      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      display: "flex", flexDirection: "column",
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      {showImage && (
        <div style={{ position: "relative", height: 160, flexShrink: 0, overflow: "hidden" }}>
          <img src={imgSrc} alt={word.word} onError={() => setImgFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to bottom, transparent, #140F2E)" }} />
        </div>
      )}

      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#9B8FF5", marginBottom: 6, lineHeight: 1.3 }}>
          {word.meaning}
        </div>
        {word.example && (
          <div style={{ fontSize: 13, color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.5, marginTop: 4, maxWidth: 360 }}>
            &ldquo;{word.example}&rdquo;
          </div>
        )}
        <button onClick={speak} style={{ marginTop: 14, background: "rgba(123,104,238,0.18)", border: "1px solid rgba(123,104,238,0.3)", borderRadius: "var(--r-sm)", padding: "7px 16px", cursor: "pointer", color: "#9B8FF5", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6, WebkitTapHighlightColor: "transparent" }}>
          <Volume2 size={14} /> Phát âm
        </button>
      </div>
    </div>
  );
}

/* ── Session Done ── */
function Done({ stats, onRestart }: { stats: { total: number; correct: number; forgot: number }; onRestart: () => void }) {
  const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", padding: "24px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#7B68EE,#E879A0)", boxShadow: "0 8px 32px rgba(123,104,238,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🎉</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "var(--text-1)" }}>Hoàn thành phiên ôn tập!</div>
        <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Thuật toán Spaced Repetition đã cập nhật ngày ôn mới</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%", maxWidth: 300 }}>
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 8px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#2DD4BF" }}>{stats.correct}</div>
          <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>Thuộc</div>
        </div>
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 8px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#FB7185" }}>{stats.forgot}</div>
          <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>Quên</div>
        </div>
        <div style={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 8px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#9B8FF5" }}>{pct}%</div>
          <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 2 }}>Tỷ lệ</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 300, marginTop: 8 }}>
        <Link href="/" style={{ flex: 1, display: "block" }}>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }}>Dashboard</button>
        </Link>
        <button onClick={onRestart} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
          <RotateCcw size={14} /> Ôn tiếp
        </button>
      </div>
    </motion.div>
  );
}

/* ── Mode Selector ── */
function ModeSelector({
  dueCount,
  weakCount,
  allCount,
  words,
  onSelectMode,
}: {
  dueCount: number;
  weakCount: number;
  allCount: number;
  words: Word[];
  onSelectMode: (mode: "due" | "weak" | "micro" | "all" | "topic", topic?: TopicTag) => void;
}) {
  const [showTopics, setShowTopics] = useState(false);

  const topicCounts = TOPIC_TAGS.reduce((acc, t) => {
    acc[t] = words.filter(w => w.topic === t).length;
    return acc;
  }, {} as Record<TopicTag, number>);

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)" }}>Chế Độ Ôn Tập (SM-2)</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
          Phương pháp ghi nhớ ngắt quãng chống đường cong lãng quên
        </p>
      </div>

      {!showTopics ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* 1.1. Ôn tập Theo lịch */}
          <button onClick={() => onSelectMode("due")} className="btn btn-secondary" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: "var(--r-md)",
            border: dueCount > 0 ? "1.5px solid rgba(123,104,238,0.4)" : "1px solid var(--border)",
            background: dueCount > 0 ? "rgba(123,104,238,0.08)" : "var(--bg-raised)",
            minHeight: "68px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(123,104,238,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={18} color="#9B8FF5" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>🎯 Ôn tập Theo lịch</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Các từ đã đến mốc next_review hôm nay</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: dueCount > 0 ? "#7B68EE" : "rgba(255,255,255,0.05)", color: dueCount > 0 ? "white" : "var(--text-3)" }}>
              {dueCount} từ
            </span>
          </button>

          {/* 1.2. Ôn tập "Cấp cứu" từ hay sai */}
          <button onClick={() => onSelectMode("weak")} className="btn btn-secondary" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: "var(--r-md)", background: "var(--bg-raised)", minHeight: "68px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(251,113,133,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ShieldAlert size={18} color="#FB7185" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>🔴 &ldquo;Cấp cứu&rdquo; từ hay sai</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Tỷ lệ sai cao hoặc thuộc độ khó thấp</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: weakCount > 0 ? "rgba(251,113,133,0.15)" : "rgba(255,255,255,0.05)", color: weakCount > 0 ? "#FB7185" : "var(--text-3)", border: weakCount > 0 ? "1px solid rgba(251,113,133,0.3)" : "none" }}>
              {weakCount} từ
            </span>
          </button>

          {/* 1.3. Ôn tập Nhanh 2 phút */}
          <button onClick={() => onSelectMode("micro")} className="btn btn-secondary" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: "var(--r-md)", background: "var(--bg-raised)", minHeight: "68px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Timer size={18} color="#F59E0B" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>⏱️ Ôn tập Nhanh 2 phút</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Lướt ngẫu nhiên 5-10 từ khi rảnh rỗi</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              5-10 từ
            </span>
          </button>

          {/* Ôn theo chủ đề */}
          <button onClick={() => setShowTopics(true)} className="btn btn-secondary" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: "var(--r-md)", background: "var(--bg-raised)", minHeight: "68px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(45,212,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={18} color="#2DD4BF" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-1)" }}>🏷️ Ôn theo chủ đề</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>Lọc từ theo 16 chủ đề học tập</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-3)" />
          </button>

          {/* Ôn tất cả */}
          <button onClick={() => onSelectMode("all")} className="btn btn-secondary" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: "var(--r-md)", background: "var(--bg-raised)", minHeight: "60px"
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-2)" }}>📚 Ôn tất cả từ vựng</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)", color: "var(--text-4)" }}>
              {allCount} từ
            </span>
          </button>

        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => setShowTopics(false)} className="btn btn-secondary" style={{ padding: "8px 12px", fontSize: 12, alignSelf: "flex-start", minHeight: 34 }}>
            <ArrowLeft size={13} /> Quay lại
          </button>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {TOPIC_TAGS.map(topic => {
              const count = topicCounts[topic] || 0;
              return (
                <button key={topic} onClick={() => onSelectMode("topic", topic)} disabled={count === 0} className="btn btn-secondary" style={{
                  padding: "12px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "var(--r-md)", background: "var(--bg-raised)", opacity: count === 0 ? 0.4 : 1, cursor: count === 0 ? "not-allowed" : "pointer", minHeight: "56px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>
                    <span>{TOPIC_EMOJI[topic]}</span>
                    <span>{topic}</span>
                  </div>
                  <span style={{ fontSize: 10, color: count > 0 ? "#9B8FF5" : "var(--text-4)", padding: "2px 6px", borderRadius: 99, background: "rgba(123,104,238,0.1)" }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Main Flashcard Page ── */
export default function FlashcardPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [queue, setQueue] = useState<Word[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ total: 0, correct: 0, forgot: 0 });
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"due" | "weak" | "micro" | "all" | "topic" | null>(null);
  const [chosenTopic, setChosenTopic] = useState<TopicTag | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getWords();
    setWords(all);
    setQueue([]);
    setMode(null);
    setChosenTopic(null);
    setDone(false);
    setStats({ total: 0, correct: 0, forgot: 0 });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startSession = (selectedMode: "due" | "weak" | "micro" | "all" | "topic", topic?: TopicTag) => {
    setLoading(true);
    setMode(selectedMode);
    if (topic) setChosenTopic(topic);

    let filteredQueue: Word[] = [];
    if (selectedMode === "due") {
      filteredQueue = words.filter(w => new Date(w.nextReview) <= new Date());
    } else if (selectedMode === "weak") {
      filteredQueue = [...words]
        .filter(w => w.difficulty < 3 || (w.reviewCount > 0 && w.correctCount < w.reviewCount - w.correctCount))
        .sort((a, b) => a.difficulty - b.difficulty);
      if (filteredQueue.length === 0) {
        filteredQueue = [...words].sort((a, b) => a.difficulty - b.difficulty).slice(0, 10);
      }
    } else if (selectedMode === "micro") {
      filteredQueue = [...words].sort(() => Math.random() - 0.5).slice(0, 7);
    } else if (selectedMode === "all") {
      filteredQueue = [...words].sort(() => Math.random() - 0.5);
    } else if (selectedMode === "topic" && topic) {
      filteredQueue = words.filter(w => w.topic === topic).sort(() => Math.random() - 0.5);
    }

    setQueue(filteredQueue);
    setIdx(0);
    setFlipped(false);
    setDone(false);
    setStats({ total: 0, correct: 0, forgot: 0 });
    setLoading(false);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (done || mode === null || !queue[idx]) return;
      if (e.code === "Space") { e.preventDefault(); setFlipped(f => !f); }
      if (flipped) {
        if (e.key === "1") rate("forgot");
        if (e.key === "2") rate("remembered");
        if (e.key === "3") rate("easy");
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [done, idx, queue, flipped, mode]);

  const rate = async (r: FlashcardRating) => {
    const w = queue[idx]; if (!w) return;
    await updateWord(w.id, applyRating(w, r));
    const ok = r !== "forgot";
    const ns = { total: stats.total + 1, correct: stats.correct + (ok ? 1 : 0), forgot: stats.forgot + (!ok ? 1 : 0) };
    setStats(ns);
    if (idx + 1 >= queue.length) { await recordSession(ns.total, ns.correct); setDone(true); }
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(123,104,238,0.3)", borderTopColor: "#7B68EE", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const dueCount = words.filter(w => new Date(w.nextReview) <= new Date()).length;
  const weakCount = words.filter(w => w.difficulty < 3 || (w.reviewCount > 0 && w.correctCount < w.reviewCount - w.correctCount)).length;
  const allCount = words.length;

  const cur = queue[idx];

  const getSubtext = () => {
    if (mode === "due") return "🎯 Ôn theo lịch SM-2";
    if (mode === "weak") return "🔴 Cấp cứu từ hay sai";
    if (mode === "micro") return "⏱️ Ôn nhanh 2 phút";
    if (mode === "all") return "📚 Ôn tất cả";
    if (mode === "topic") return `🏷️ ${chosenTopic}`;
    return `Kho: ${allCount} từ`;
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 24px", display: "flex", flexDirection: "column", minHeight: "100dvh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        {mode === null ? (
          <Link href="/" style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
              <ArrowLeft size={17} color="var(--text-2)" />
            </button>
          </Link>
        ) : (
          <button onClick={load} className="btn btn-secondary" style={{ padding: 10, borderRadius: "var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>
            <BrainCircuit size={18} color="#7B68EE" /> Phòng Ôn Tập
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{getSubtext()}</div>
        </div>
        {mode !== null && !done && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, background: "rgba(123,104,238,0.12)", border: "1px solid rgba(123,104,238,0.25)", fontSize: 13, fontWeight: 700, color: "#9B8FF5" }}>
            <Trophy size={13} /> {stats.correct}/{stats.total}
          </div>
        )}
      </div>

      {mode === null ? (
        <ModeSelector dueCount={dueCount} weakCount={weakCount} allCount={allCount} words={words} onSelectMode={startSession} />
      ) : done ? (
        <Done stats={stats} onRestart={load} />
      ) : queue.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Không có từ nào trong danh sách!</div>
          <button onClick={load} className="btn btn-primary" style={{ padding: "12px 24px" }}>Chọn chế độ khác</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Progress cur={idx + 1} tot={queue.length} />

          {/* Fixed height 360px container for flip scene so it never squishes! */}
          <div className="flip-scene" style={{ height: 360, width: "100%", position: "relative" }} onClick={() => setFlipped(f => !f)}>
            <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
              <div className="flip-face">
                <CardFront word={cur} />
              </div>
              <div className="flip-face flip-back">
                <CardBack word={cur} />
              </div>
            </div>
          </div>

          {/* Rating buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
            <button onClick={() => rate("forgot")} className="btn btn-danger" style={{ padding: "14px 8px", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>Quên</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>Học lại ngay</span>
            </button>
            <button onClick={() => rate("remembered")} className="btn btn-secondary" style={{ padding: "14px 8px", flexDirection: "column", gap: 4, borderColor: "rgba(123,104,238,0.3)", color: "#9B8FF5" }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>Tạm nhớ</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>+3 ngày</span>
            </button>
            <button onClick={() => rate("easy")} className="btn btn-success" style={{ padding: "14px 8px", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>Rất thuộc</span>
              <span style={{ fontSize: 10, opacity: 0.7 }}>+7 ngày</span>
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} button,a{-webkit-tap-highlight-color:transparent}`}</style>
    </div>
  );
}
