"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, CheckCircle2, ArrowLeft, Trophy, RotateCcw, Volume2, ChevronRight, Zap, ShieldAlert, Timer, Sparkles } from "lucide-react";
import { getWords, getDueWords, applyRating, updateWord, recordSession } from "@/lib/db";
import { Word, FlashcardRating, TopicTag, TOPIC_TAGS, TOPIC_EMOJI } from "@/lib/types";
import Link from "next/link";
import { speakWord } from "@/lib/audio";

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
      background: "#FFFFFF",
      border: "2.5px solid #000000",
      borderRadius: 20,
      boxShadow: "5px 5px 0px #000000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "32px 24px", cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "#FFE052", border: "2px solid #000000",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 16, boxShadow: "2px 2px 0 #000",
      }}>
        <BrainCircuit size={24} color="#000000" strokeWidth={2.5} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: "#000000", textAlign: "center", letterSpacing: "-0.01em", lineHeight: 1.15, marginBottom: 8 }}>
        {word.word}
      </div>
      <div onClick={(e) => speakWord(word.word, e)} title="Nghe phát âm" style={{ fontSize: 14, fontWeight: 700, color: "#000000", fontFamily: "monospace", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", background: "#4ECCD3", border: "2px solid #000000", borderRadius: 99, boxShadow: "2px 2px 0 #000" }}>
        {word.phonetics} <Volume2 size={15} color="#000000" strokeWidth={2.5} />
      </div>
      <div style={{ position: "absolute", bottom: 18, display: "flex", alignItems: "center", gap: 6, color: "#555555", fontSize: 13, fontWeight: 700 }}>
        Chạm để xem nghĩa <ChevronRight size={14} strokeWidth={3} />
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
      setImgSrc(`https://loremflickr.com/600/360/${encodeURIComponent(word.word)}`);
    }
  }, [word.id, word.imageUrl, word.word]);

  const showImage = imgSrc && !imgFailed;

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "#FFFFFF",
      border: "2.5px solid #000000",
      borderRadius: 20,
      boxShadow: "5px 5px 0px #000000",
      display: "flex", flexDirection: "column",
      cursor: "pointer", position: "relative", overflow: "hidden",
    }}>
      {showImage && (
        <div style={{ position: "relative", height: 160, flexShrink: 0, overflow: "hidden", borderBottom: "2.5px solid #000000" }}>
          <img src={imgSrc} alt={word.word} referrerPolicy="no-referrer" onError={() => setImgFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#9C8EFA", marginBottom: 8, lineHeight: 1.3, textShadow: "1px 1px 0 #000" }}>
          {word.meaning}
        </div>
        {word.example && (
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2B2B2B", fontStyle: "italic", lineHeight: 1.5, marginTop: 4, maxWidth: 360 }}>
            &ldquo;{word.example}&rdquo;
          </div>
        )}
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
      <div style={{ width: 80, height: 80, borderRadius: 20, background: "#FFE052", border: "2.5px solid #000", boxShadow: "4px 4px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🎉</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#000000" }}>Hoàn thành phiên ôn tập!</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#555555", marginTop: 4 }}>Thuật toán Spaced Repetition đã cập nhật ngày ôn mới</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, width: "100%", maxWidth: 320 }}>
        <div style={{ background: "#38E54D", border: "2.5px solid #000", borderRadius: 14, padding: "12px 8px", boxShadow: "3px 3px 0 #000" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#000" }}>{stats.correct}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#000", marginTop: 2 }}>Thuộc</div>
        </div>
        <div style={{ background: "#FF5964", border: "2.5px solid #000", borderRadius: 14, padding: "12px 8px", boxShadow: "3px 3px 0 #000" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFF" }}>{stats.forgot}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#FFF", marginTop: 2 }}>Quên</div>
        </div>
        <div style={{ background: "#FFE052", border: "2.5px solid #000", borderRadius: 14, padding: "12px 8px", boxShadow: "3px 3px 0 #000" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#000" }}>{pct}%</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#000", marginTop: 2 }}>Tỷ lệ</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320, marginTop: 8 }}>
        <Link href="/" style={{ flex: 1, display: "block" }}>
          <button className="btn btn-secondary" style={{ width: "100%", padding: "12px" }}>Dashboard</button>
        </Link>
        <button onClick={onRestart} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>
          <RotateCcw size={14} strokeWidth={3} /> Ôn tiếp
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
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#000000" }}>Chế Độ Ôn Tập (SM-2)</h2>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#555555", marginTop: 4 }}>
          Phương pháp ghi nhớ ngắt quãng chống đường cong lãng quên
        </p>
      </div>

      {!showTopics ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* 1.1. Ôn tập Theo lịch */}
          <button onClick={() => onSelectMode("due")} className="btn" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: 16,
            border: "2.5px solid #000000",
            background: "#9C8EFA",
            boxShadow: "4px 4px 0px #000000",
            minHeight: "68px", color: "#000000",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}>
                <Zap size={20} color="#000000" strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>🎯 Ôn tập Theo lịch</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2B2B2B", marginTop: 2 }}>Các từ đã đến mốc next_review hôm nay</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, padding: "4px 12px", background: "#FFE052", color: "#000000", border: "2px solid #000000", borderRadius: 99, boxShadow: "2px 2px 0 #000" }}>
              {dueCount} từ
            </span>
          </button>

          {/* 1.2. Ôn tập "Cấp cứu" từ hay sai */}
          <button onClick={() => onSelectMode("weak")} className="btn" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: 16, background: "#FF5964", border: "2.5px solid #000000", boxShadow: "4px 4px 0px #000000", minHeight: "68px", color: "#FFFFFF",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}>
                <ShieldAlert size={20} color="#000000" strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#FFFFFF", textShadow: "1px 1px 0 #000" }}>🔴 &ldquo;Cấp cứu&rdquo; từ hay sai</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", marginTop: 2, opacity: 0.95 }}>Tỷ lệ sai cao hoặc thuộc độ khó thấp</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, padding: "4px 12px", background: "#FFFFFF", color: "#000000", border: "2px solid #000000", borderRadius: 99, boxShadow: "2px 2px 0 #000" }}>
              {weakCount} từ
            </span>
          </button>

          {/* 1.3. Ôn tập Nhanh 2 phút */}
          <button onClick={() => onSelectMode("micro")} className="btn" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: 16, background: "#FFE052", border: "2.5px solid #000000", boxShadow: "4px 4px 0px #000000", minHeight: "68px", color: "#000000",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}>
                <Timer size={20} color="#000000" strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>⏱️ Ôn tập Nhanh 2 phút</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2B2B2B", marginTop: 2 }}>Lướt ngẫu nhiên 5-10 từ khi rảnh rỗi</div>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, padding: "4px 12px", background: "#FFFFFF", color: "#000000", border: "2px solid #000000", borderRadius: 99, boxShadow: "2px 2px 0 #000" }}>
              5-10 từ
            </span>
          </button>

          {/* Ôn theo chủ đề */}
          <button onClick={() => setShowTopics(true)} className="btn" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: 16, background: "#4ECCD3", border: "2.5px solid #000000", boxShadow: "4px 4px 0px #000000", minHeight: "68px", color: "#000000",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, border: "2px solid #000", borderRadius: 10, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}>
                <Sparkles size={20} color="#000000" strokeWidth={3} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>🏷️ Ôn theo chủ đề</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2B2B2B", marginTop: 2 }}>Lọc từ theo 16 chủ đề học tập</div>
              </div>
            </div>
            <ChevronRight size={18} color="#000000" strokeWidth={3} />
          </button>

          {/* Ôn tất cả */}
          <button onClick={() => onSelectMode("all")} className="btn" style={{
            padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", borderRadius: 16, background: "#FFFFFF", border: "2.5px solid #000000", boxShadow: "4px 4px 0px #000000", minHeight: "60px", color: "#000000",
          }}>
            <div style={{ fontWeight: 900, fontSize: 16, color: "#000000" }}>📚 Ôn tất cả từ vựng</div>
            <span style={{ fontSize: 12, fontWeight: 900, padding: "4px 12px", background: "#F5EFE6", color: "#000000", border: "2px solid #000000", borderRadius: 99, boxShadow: "2px 2px 0 #000" }}>
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
