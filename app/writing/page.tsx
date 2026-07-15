"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Send, Loader2, ArrowLeft, ChevronDown, ChevronUp, Sparkles, Clock } from "lucide-react";
import { getJournalEntries, saveJournalEntry, updateJournalFeedback } from "@/lib/db";
import { JournalEntry } from "@/lib/types";
import Link from "next/link";

/* ── AI mock ── */
function genFeedback(text: string): string {
  const issues: string[] = [];
  if (/\bi go\b/i.test(text)) issues.push('**"I went"** thay vì "I go" → Dùng *past simple* khi kể chuyện đã xảy ra.');
  if (/\bdepend on\b/i.test(text)) issues.push('**"depends on"** → Chủ ngữ số ít thêm **-s** ở hiện tại đơn.');
  if (/\bmore better\b/i.test(text)) issues.push('"better" đã là so sánh hơn — bỏ "more" đi.');
  if (/\bvery very\b/i.test(text)) issues.push('Tránh lặp "very very" — dùng **"extremely"** hoặc **"incredibly"**.');

  const wc = text.trim().split(/\s+/).filter(Boolean).length;
  const sc = text.split(/[.!?]+/).filter(Boolean).length;

  let out = `### Tổng quan\n**${wc} từ** · **${sc} câu** · `;
  out += wc < 30 ? "Hãy viết nhiều hơn để luyện tập hiệu quả!\n\n"
       : wc < 80 ? "Tốt! Bạn đang tiến bộ đều đặn.\n\n"
       : "Xuất sắc! Bài viết chi tiết và đầy đủ.\n\n";

  out += issues.length
    ? `### Lỗi cần chú ý\n${issues.map(i=>`• ${i}`).join("\n")}\n\n`
    : `### Không phát hiện lỗi phổ biến\nBài viết khá ổn! Tiếp tục luyện tập.\n\n`;

  const tips = [
    '**Furthermore** *(Hơn nữa)* — bổ sung ý kiến',
    '**Nevertheless** *(Tuy nhiên)* — diễn tả tương phản',
    '**In retrospect** *(Nhìn lại)* — hữu ích cho nhật ký',
    '**Consequently** *(Do đó)* — kết quả hành động',
    '**Undoubtedly** *(Chắc chắn)* — nhấn mạnh quan điểm',
  ];
  return out + `### Từ gợi ý hôm nay\n${tips[Math.floor(Math.random()*tips.length)]}`;
}

function FeedbackView({ text }: { text:string }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {text.split("\n").map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <div key={i} style={{ fontSize:11, fontWeight:800, letterSpacing:"0.1em",
              textTransform:"uppercase", color:"#9B8FF5", marginTop: i > 0 ? 12 : 0, marginBottom:2 }}>
              {line.replace("###","").trim()}
            </div>
          );
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ fontSize:13.5, lineHeight:1.65, color:"var(--text-2)", margin:0 }}>
            {parts.map((p,j)=>
              p.startsWith("**") ? <strong key={j} style={{color:"var(--text-1)",fontWeight:700}}>
                {p.replace(/\*\*/g,"")}
              </strong> : <span key={j}>{p}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

function HistoryItem({ entry }: { entry:JournalEntry }) {
  const [open,setOpen] = useState(false);
  return (
    <div style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
      borderRadius:"var(--r-md)", overflow:"hidden", transition:"border-color 0.15s" }}>
      <button onClick={()=>setOpen(!open)} style={{
        width:"100%", display:"flex", alignItems:"center",
        gap:12, padding:"12px 16px", background:"none", border:"none",
        cursor:"pointer", textAlign:"left",
      }}>
        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
          background:"var(--brand-dim)", border:"1px solid rgba(123,104,238,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center" }}>
          <PenLine size={15} color="#9B8FF5" />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:13, color:"var(--text-1)" }}>
            {new Date(entry.date).toLocaleDateString("vi-VN",{weekday:"short",day:"numeric",month:"long"})}
          </div>
          <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>
            {entry.wordCount} từ {entry.aiFeedback?"· đã check AI":""}
          </div>
        </div>
        {open ? <ChevronUp size={14} color="var(--text-3)"/> : <ChevronDown size={14} color="var(--text-3)"/>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
            exit={{height:0,opacity:0}} style={{overflow:"hidden"}}>
            <div style={{ padding:"0 16px 16px", borderTop:"1px solid var(--border)" }}>
              <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.7,
                whiteSpace:"pre-wrap", paddingTop:14, marginBottom:0 }}>
                {entry.content}
              </p>
              {entry.aiFeedback && (
                <div style={{ marginTop:14, background:"rgba(123,104,238,0.06)",
                  border:"1px solid rgba(123,104,238,0.18)", borderRadius:"var(--r-sm)", padding:14 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:"#9B8FF5",
                    letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>
                    🤖 AI Feedback
                  </div>
                  <FeedbackView text={entry.aiFeedback} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WritingPage() {
  const [content, setContent]   = useState("");
  const [feedback, setFeedback] = useState<string|null>(null);
  const [checking, setChecking] = useState(false);
  const [history, setHistory]   = useState<JournalEntry[]>([]);
  const [tab, setTab]           = useState<"write"|"check"|"history">("write");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const load = async () => {
      const entries = await getJournalEntries();
      setHistory(entries);
      const todayEntry = entries.find(e => e.date === today);
      if (todayEntry) {
        setContent(todayEntry.content);
        if (todayEntry.aiFeedback) setFeedback(todayEntry.aiFeedback);
      }
    };
    load();
  }, [today]);

  const check = async () => {
    if (!content.trim()) return;
    setChecking(true); setTab("check");
    await new Promise(r => setTimeout(r, 1500));
    const fb = genFeedback(content);
    setFeedback(fb);
    const entry = await saveJournalEntry({ date:today, content, aiFeedback:fb });
    await updateJournalFeedback(entry.id, fb);
    setHistory(await getJournalEntries());
    setChecking(false);
  };

  const wc = content.trim().split(/\s+/).filter(Boolean).length;

  /* shared editor block */
  const Editor = () => (
    <div style={{ display:"flex", flexDirection:"column", gap:12, flex:1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-3)",
          textTransform:"uppercase", letterSpacing:"0.08em" }}>Nhật ký hôm nay</span>
        <span style={{ fontSize:12, color:"var(--text-4)" }}>{wc} từ</span>
      </div>
      <textarea value={content} onChange={e=>setContent(e.target.value)}
        placeholder={"Today, I...\n\nViết tự do bằng tiếng Anh — về ngày hôm nay, điều bạn học được, kế hoạch sắp tới..."}
        style={{
          flex:1, minHeight:320, background:"rgba(255,255,255,0.03)",
          border:"1.5px solid var(--border)", borderRadius:"var(--r-md)",
          color:"var(--text-1)", fontSize:14, padding:16, lineHeight:1.8,
          resize:"none", outline:"none", fontFamily:"inherit",
          transition:"border-color 0.18s",
        }}
        onFocus={e=>(e.target.style.borderColor="rgba(123,104,238,0.5)")}
        onBlur={e=>(e.target.style.borderColor="var(--border)")}
      />
      <button onClick={check} disabled={checking||!content.trim()}
        className="btn btn-primary"
        style={{ padding:"13px", fontSize:14, borderRadius:"var(--r-md)",
          opacity: (checking||!content.trim()) ? 0.5 : 1,
          cursor: (checking||!content.trim()) ? "not-allowed" : "pointer" }}>
        {checking
          ? <><Loader2 size={16} style={{animation:"spin 0.7s linear infinite"}}/> Đang phân tích...</>
          : <><Send size={16}/> Check bài bằng AI</>}
      </button>
    </div>
  );

  /* shared feedback block */
  const AIPanel = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-3)",
          textTransform:"uppercase", letterSpacing:"0.08em" }}>AI Feedback</span>
        {feedback && !checking && (
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:99,
            background:"var(--teal-dim)", color:"var(--teal)", border:"1px solid rgba(45,212,191,0.25)" }}>
            ✓ Đã phân tích
          </span>
        )}
      </div>
      <div style={{ flex:1, minHeight:320, background:"var(--bg-raised)",
        border:"1px solid var(--border)", borderRadius:"var(--r-md)",
        padding:20, overflowY:"auto" }}>
        {checking ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", height:"100%", gap:16, textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:14,
              background:"var(--brand-dim)", border:"1px solid rgba(123,104,238,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Loader2 size={22} color="#9B8FF5" style={{animation:"spin 0.7s linear infinite"}} />
            </div>
            <div>
              <div style={{ fontWeight:700, color:"var(--text-1)" }}>Đang phân tích...</div>
              <div style={{ fontSize:12, color:"var(--text-3)", marginTop:4 }}>AI đang đọc bài của bạn</div>
            </div>
          </div>
        ) : feedback ? (
          <FeedbackView text={feedback} />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
            justifyContent:"center", height:"100%", gap:14, textAlign:"center", padding:20 }}>
            <div style={{ width:52, height:52, borderRadius:14,
              background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Sparkles size={24} color="var(--text-4)" />
            </div>
            <div style={{ fontSize:14, color:"var(--text-3)", lineHeight:1.6 }}>
              Viết nhật ký xong<br/>rồi bấm <span style={{color:"#9B8FF5",fontWeight:700}}>"Check bài bằng AI"</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 24px",
      display:"flex", flexDirection:"column", minHeight:"100dvh" }}>

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        style={{ display:"flex", alignItems:"center", gap:14, marginBottom:28 }}>
        <Link href="/" style={{ textDecoration:"none" }} className="mobile-only">
          <button className="btn btn-secondary" style={{padding:10,borderRadius:"var(--r-sm)"}}>
            <ArrowLeft size={17} color="var(--text-2)"/>
          </button>
        </Link>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <PenLine size={20} color="#E879A0" />
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)" }}>AI Writing Corner</h1>
          </div>
          <div style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>
            Viết nhật ký tiếng Anh, AI phân tích và sửa lỗi ngay lập tức
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600,
          padding:"6px 12px", borderRadius:99,
          background:"var(--pink-dim)", color:"var(--pink)", border:"1px solid rgba(232,121,160,0.25)" }}
          className="desktop-only">
          <Clock size={13}/> {new Date().toLocaleDateString("vi-VN",{day:"numeric",month:"long"})}
        </div>
      </motion.div>

      {/* ── Desktop split ── */}
      <div className="writing-desktop" style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
        gap:24, flex:1 }}>
        <Editor />
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <AIPanel />
          {history.length > 0 && (
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-3)",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>
                Nhật ký trước ({history.length})
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:240, overflowY:"auto" }}>
                {history.slice(0,6).map(e=><HistoryItem key={e.id} entry={e}/>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile tabs ── */}
      <div className="writing-mobile" style={{ display:"none", flexDirection:"column", flex:1, gap:16 }}>
        {/* Tab bar */}
        <div style={{ display:"flex", gap:4, padding:4,
          background:"rgba(255,255,255,0.04)", borderRadius:"var(--r-md)",
          border:"1px solid var(--border)" }}>
          {(["write","check","history"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              flex:1, padding:"9px 4px", borderRadius:"var(--r-sm)",
              border:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              transition:"all 0.18s",
              background: tab===t ? "linear-gradient(135deg,#7B68EE,#9B8FF5)" : "transparent",
              color: tab===t ? "white" : "var(--text-3)",
              boxShadow: tab===t ? "0 4px 16px rgba(123,104,238,0.4)" : "none",
            }}>
              {t==="write" ? "✏️ Viết" : t==="check" ? "🤖 AI" : "📖 Lịch sử"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab==="write" && (
            <motion.div key="w" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}
              style={{ flex:1, display:"flex", flexDirection:"column" }}>
              <Editor />
            </motion.div>
          )}
          {tab==="check" && (
            <motion.div key="c" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}
              style={{ flex:1, display:"flex", flexDirection:"column" }}>
              <AIPanel />
            </motion.div>
          )}
          {tab==="history" && (
            <motion.div key="h" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}}
              style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {history.length===0
                ? <div style={{ padding:"48px 0", textAlign:"center", color:"var(--text-3)" }}>
                    Chưa có nhật ký nào
                  </div>
                : history.map(e=><HistoryItem key={e.id} entry={e}/>)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) {
          .writing-desktop { display: none !important; }
          .writing-mobile  { display: flex !important; }
          .desktop-only    { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
