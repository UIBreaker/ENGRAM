"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, X, Sparkles, Check, Loader2 } from "lucide-react";
import { addWord } from "@/lib/db";

type Status = "idle" | "loading" | "success" | "error";

const TOPICS = ["Đời sống", "Học thuật", "Lập trình", "Du lịch", "Công việc", "Ẩm thực", "Y tế", "Giải trí"];

export default function QuickAddButton() {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [topic, setTopic] = useState("Đời sống");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else { setWord(""); setMeaning(""); setStatus("idle"); setErrorMsg(""); }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleSave() {
    if (!word.trim() || !meaning.trim()) {
      setErrorMsg("Vui lòng nhập từ và nghĩa!");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await addWord({
        word: word.trim(),
        phonetics: "",
        meaning: meaning.trim(),
        example: "",
        topic: topic as import("@/lib/types").TopicTag,
        imageUrl: undefined,
      });
      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        setStatus("idle");
      }, 1200);
    } catch {
      setStatus("error");
      setErrorMsg("Lỗi khi lưu từ. Thử lại!");
    }
  }

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .quick-add-btn { right: 28px !important; left: auto !important; bottom: 28px !important; }
        }
        @media (max-width: 767px) {
          .quick-add-btn { right: 18px !important; left: auto !important; bottom: 84px !important; }
        }
        .quick-add-btn {
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }
        .quick-add-btn:hover {
          transform: translate(-2px, -2px) !important;
          box-shadow: 5px 5px 0 var(--border-color) !important;
        }
        .quick-add-btn:active {
          transform: translate(2px, 2px) !important;
          box-shadow: 1px 1px 0 var(--border-color) !important;
        }
        .quick-add-btn:hover .qa-tooltip {
          opacity: 1 !important;
          transform: translateX(-100%) translateY(-50%) scale(1) !important;
        }
        .qa-input {
          width: 100%;
          background: var(--input-bg);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          color: var(--input-text);
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-inter), sans-serif;
          padding: 9px 13px;
          outline: none;
          box-shadow: 2px 2px 0 var(--shadow-color);
          transition: box-shadow 0.1s, transform 0.1s, border-color 0.2s;
        }
        .qa-input:focus {
          box-shadow: 4px 4px 0 var(--neo-purple, #9C8EFA);
          border-color: #9C8EFA;
          transform: translate(-1px, -1px);
        }
        .qa-input::placeholder { color: var(--text-4); }
        .qa-select {
          width: 100%;
          background: var(--input-bg);
          border: 2px solid var(--border-color);
          border-radius: 10px;
          color: var(--input-text);
          font-size: 13px;
          font-weight: 700;
          font-family: var(--font-inter), sans-serif;
          padding: 8px 12px;
          outline: none;
          cursor: pointer;
          box-shadow: 2px 2px 0 var(--shadow-color);
          -webkit-appearance: none;
          appearance: none;
          transition: border-color 0.2s;
        }
      `}</style>

      {/* Floating + Button at Bottom-Right */}
      <button
        className="quick-add-btn"
        onClick={() => setOpen(true)}
        aria-label="Thêm từ nhanh"
        style={{
          position: "fixed",
          right: 28, bottom: 28,
          zIndex: 200,
          width: 48, height: 48,
          borderRadius: "50%",
          background: "#FFE052",
          border: "2.5px solid var(--border-color)",
          boxShadow: "4px 4px 0 var(--border-color)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Plus size={24} color="#000000" strokeWidth={3} />
        {/* Tooltip on hover */}
        <span
          className="qa-tooltip"
          style={{
            position: "absolute",
            left: -12, top: "50%",
            transform: "translateX(-100%) translateY(-50%) scale(0.9)",
            opacity: 0,
            pointerEvents: "none",
            background: "var(--card-bg)",
            color: "var(--text-1)",
            border: "2px solid var(--border-color)",
            borderRadius: 8,
            boxShadow: "2px 2px 0 var(--border-color)",
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
            transition: "opacity 0.15s ease, transform 0.15s ease",
          }}
        >
          + Thêm từ nhanh
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
            WebkitBackdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Modal */}
      {open && (
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 400,
          display: "flex", justifyContent: "center",
          animation: "qaSlideUp 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
        }}>
          <style>{`
            @keyframes qaSlideUp {
              from { transform: translateY(100%); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>

          <div style={{
            width: "100%", maxWidth: 480,
            background: "var(--card-bg)",
            border: "2.5px solid var(--border-color)",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 0 var(--border-color)",
            padding: "20px 20px 32px",
            transition: "background 0.2s, border-color 0.2s",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "#FFE052", border: "2px solid var(--border-color)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "2px 2px 0 var(--border-color)",
                }}>
                  <Sparkles size={15} color="#000" strokeWidth={2.5} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 14, color: "var(--text-1)" }}>Thêm từ nhanh</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>Lưu từ mới vào kho từ vựng</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: "var(--bg-surface)",
                  border: "2px solid var(--border-color)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "2px 2px 0 var(--border-color)",
                }}
              >
                <X size={14} color="var(--text-2)" strokeWidth={2.5} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>
                  Từ tiếng Anh *
                </label>
                <input
                  ref={inputRef}
                  className="qa-input"
                  value={word}
                  onChange={e => setWord(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Perseverance"
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>
                  Nghĩa tiếng Việt *
                </label>
                <input
                  className="qa-input"
                  value={meaning}
                  onChange={e => setMeaning(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Sự kiên trì"
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 900, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>
                  Chủ đề
                </label>
                <select className="qa-select" value={topic} onChange={e => setTopic(e.target.value)}>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Error */}
              {errorMsg && (
                <div style={{
                  padding: "8px 12px", borderRadius: 8,
                  background: "rgba(255,89,100,0.1)", border: "1.5px solid #FF5964",
                  fontSize: 12, fontWeight: 700, color: "#FF5964",
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={status === "loading" || status === "success"}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 18px", borderRadius: 12,
                  border: "2.5px solid var(--border-color)",
                  background: status === "success" ? "#38E54D" : "#FFE052",
                  color: "#000000", fontWeight: 900, fontSize: 14,
                  cursor: status === "loading" || status === "success" ? "default" : "pointer",
                  boxShadow: "3px 3px 0 var(--border-color)",
                  transition: "background 0.2s, transform 0.08s",
                  marginTop: 4,
                  opacity: status === "loading" ? 0.8 : 1,
                }}
              >
                {status === "loading" && <Loader2 size={16} strokeWidth={2.5} style={{ animation: "spin 0.8s linear infinite" }} />}
                {status === "success" && <Check size={16} strokeWidth={3} />}
                {status === "idle" && <Plus size={16} strokeWidth={3} />}
                {status === "error" && <Plus size={16} strokeWidth={3} />}
                {status === "loading" ? "Đang lưu..." : status === "success" ? "Đã lưu!" : "Lưu vào kho từ vựng"}
              </button>

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
