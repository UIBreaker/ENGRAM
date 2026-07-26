"use client";
import { useEffect, useState, useMemo, useRef, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit3, X, Check, BookOpen, ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, Link as LinkIcon, Lightbulb, FileSpreadsheet, Upload, AlertCircle, CheckCircle2, Wrench, Copy, ChevronDown as ChevDown } from "lucide-react";
import { getWords, addWord, deleteWord, updateWord } from "@/lib/db";
import { Word, TopicTag, TOPIC_TAGS, TOPIC_EMOJI, suggestTopic } from "@/lib/types";
import * as XLSX from "xlsx";

/* ── Topic config ── */
type TC = { color: string; bg: string; border: string; dot: string };
const TOPICS: Record<TopicTag, TC> = {
  "Công việc":  { color: "#93C5FD", bg: "rgba(96,165,250,0.12)",   border: "rgba(96,165,250,0.28)",   dot: "#60A5FA" },
  "Lập trình":  { color: "#6EE7B7", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.28)",   dot: "#34D399" },
  "Đời sống":   { color: "#C4B5FD", bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.28)",  dot: "#A78BFA" },
  "Du lịch":    { color: "#FCD34D", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.28)",   dot: "#FBBF24" },
  "Học thuật":  { color: "#FCA88A", bg: "rgba(249,115,22,0.12)",   border: "rgba(249,115,22,0.28)",   dot: "#F97316" },
  "Sức khỏe":   { color: "#86EFAC", bg: "rgba(74,222,128,0.10)",   border: "rgba(74,222,128,0.25)",   dot: "#4ADE80" },
  "Ẩm thực":    { color: "#FCA5A5", bg: "rgba(252,165,165,0.10)",  border: "rgba(252,165,165,0.25)",  dot: "#F87171" },
  "Thể thao":   { color: "#67E8F9", bg: "rgba(103,232,249,0.10)",  border: "rgba(103,232,249,0.25)",  dot: "#22D3EE" },
  "Kinh tế":    { color: "#6EE7B7", bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.22)",   dot: "#10B981" },
  "Nghệ thuật": { color: "#F9A8D4", bg: "rgba(249,168,212,0.10)",  border: "rgba(249,168,212,0.25)",  dot: "#EC4899" },
  "Khoa học":   { color: "#A5B4FC", bg: "rgba(165,180,252,0.10)",  border: "rgba(165,180,252,0.25)",  dot: "#818CF8" },
  "Môi trường": { color: "#BEF264", bg: "rgba(190,242,100,0.10)",  border: "rgba(190,242,100,0.22)",  dot: "#84CC16" },
  "Cảm xúc":    { color: "#FDA4AF", bg: "rgba(253,164,175,0.10)",  border: "rgba(253,164,175,0.25)",  dot: "#FB7185" },
  "Giao tiếp":  { color: "#93C5FD", bg: "rgba(147,197,253,0.10)",  border: "rgba(147,197,253,0.22)",  dot: "#38BDF8" },
  "Thành ngữ":  { color: "#FDE68A", bg: "rgba(253,230,138,0.10)",  border: "rgba(253,230,138,0.22)",  dot: "#FBBF24" },
  "Khác":       { color: "#CBD5E1", bg: "rgba(148,163,184,0.08)",  border: "rgba(148,163,184,0.18)",  dot: "#94A3B8" },
};

const DIFF       = ["Mới","Đang học","Tạm nhớ","Khá thuộc","Thuộc","Rất thuộc"];
const DIFF_COLOR = ["var(--text-4)","#F59E0B","#7B68EE","#2DD4BF","#2DD4BF","#2DD4BF"];

const TOPIC_GRADIENTS: Record<TopicTag, string> = {
  "Công việc":  "linear-gradient(135deg,#1e3a5f,#2563eb)",
  "Lập trình":  "linear-gradient(135deg,#064e3b,#059669)",
  "Đời sống":   "linear-gradient(135deg,#3b1d8a,#7c3aed)",
  "Du lịch":    "linear-gradient(135deg,#78350f,#d97706)",
  "Học thuật":  "linear-gradient(135deg,#7c2d12,#ea580c)",
  "Sức khỏe":   "linear-gradient(135deg,#064e3b,#16a34a)",
  "Ẩm thực":    "linear-gradient(135deg,#7f1d1d,#dc2626)",
  "Thể thao":   "linear-gradient(135deg,#0c4a6e,#0ea5e9)",
  "Kinh tế":    "linear-gradient(135deg,#022c22,#059669)",
  "Nghệ thuật": "linear-gradient(135deg,#831843,#ec4899)",
  "Khoa học":   "linear-gradient(135deg,#1e1b4b,#6366f1)",
  "Môi trường": "linear-gradient(135deg,#1a2e05,#65a30d)",
  "Cảm xúc":    "linear-gradient(135deg,#4c0519,#f43f5e)",
  "Giao tiếp":  "linear-gradient(135deg,#0c2a4a,#3b82f6)",
  "Thành ngữ":  "linear-gradient(135deg,#422006,#b45309)",
  "Khác":       "linear-gradient(135deg,#1e293b,#475569)",
};

/* ── Shared Components ── */
function TopicBadge({ t }: { t: TopicTag }) {
  const c = TOPICS[t];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px",
      borderRadius:99, fontSize:11, fontWeight:600, border:`1px solid ${c.border}`,
      background:c.bg, color:c.color, whiteSpace:"nowrap" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:c.dot, flexShrink:0 }} />
      {t}
    </span>
  );
}

function DiffDots({ v }: { v: number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <div style={{ display:"flex", gap:2 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ width:4, height:14, borderRadius:3,
            background: i < v ? DIFF_COLOR[v] : "rgba(255,255,255,0.07)", transition:"background 0.2s" }} />
        ))}
      </div>
      <span style={{ fontSize:11, color:"var(--text-3)", fontWeight:500 }}>{DIFF[v]}</span>
    </div>
  );
}

/* ── Image Thumbnail (dùng chung ở cả hai modal) ── */
function WordImage({ word, imageUrl, size = 200 }: { word: string; imageUrl?: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoading(true); setFailed(false);
    const url = imageUrl || `https://source.unsplash.com/featured/${size}x${Math.round(size*0.6)}/?${encodeURIComponent(word)},illustration`;
    setSrc(url);
  }, [word, imageUrl, size]);

  if (failed) return null; // ẩn nếu không load được

  return (
    <div style={{ position:"relative", height: Math.round(size * 0.55), borderRadius:"var(--r-md)",
      overflow:"hidden", background:"rgba(255,255,255,0.04)" }}>
      {loading && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", gap:8 }}>
          <div style={{ width:16, height:16, border:"2px solid rgba(123,104,238,0.3)",
            borderTopColor:"#7B68EE", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
          <span style={{ fontSize:11, color:"var(--text-4)" }}>Đang tải ảnh...</span>
        </div>
      )}
      {src && (
        <img src={src} alt={word}
          onLoad={() => setLoading(false)}
          onError={() => { setFailed(true); setLoading(false); }}
          style={{ width:"100%", height:"100%", objectFit:"cover",
            opacity: loading ? 0 : 1, transition:"opacity 0.3s" }} />
      )}
    </div>
  );
}

/* ── Add Modal ── */
function AddModal({ onClose, onAdd }: { onClose:()=>void; onAdd:(w:Word)=>void }) {
  const [f, setF] = useState({
    word:"", phonetics:"", meaning:"", example:"",
    topic:"Đời sống" as TopicTag, imageUrl:"",
  });
  const [busy, setBusy] = useState(false);
  const [showImgPreview, setShowImgPreview] = useState(false);
  const [userPickedTopic, setUserPickedTopic] = useState(false);

  // Auto-suggest topic based on word/meaning
  const suggestedTopic = useMemo(
    () => suggestTopic(f.word, f.meaning),
    [f.word, f.meaning]
  );

  // Auto-apply suggestion only if user hasn't manually picked a topic
  useEffect(() => {
    if (!userPickedTopic && suggestedTopic && suggestedTopic !== f.topic) {
      setF(prev => ({ ...prev, topic: suggestedTopic }));
    }
  }, [suggestedTopic, userPickedTopic]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.word.trim() || !f.meaning.trim()) return;
    setBusy(true);
    try {
      const newWord = await addWord({ ...f, imageUrl: f.imageUrl.trim() || undefined });
      onAdd(newWord);
      onClose();
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  const LabelStyle: React.CSSProperties = {
    fontSize:11, fontWeight:600, color:"var(--text-3)", display:"block",
    marginBottom:6, textTransform:"uppercase" as const, letterSpacing:"0.08em",
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex",
        alignItems:"flex-end", justifyContent:"center", padding:"16px 16px 24px",
        background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:60, opacity:0 }} transition={{ type:"spring", damping:28, stiffness:280 }}
        style={{ width:"100%", maxWidth:500, background:"var(--bg-overlay)",
          border:"1px solid var(--border-hi)", borderRadius:"var(--r-xl)",
          padding:24, maxHeight:"90dvh", overflowY:"auto" }}>

        {/* header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
          <div style={{ width:38, height:38, borderRadius:12, flexShrink:0,
            background:"linear-gradient(135deg,#7B68EE,#E879A0)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Sparkles size={17} color="white" />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, color:"var(--text-1)" }}>Thêm từ mới</div>
            <div style={{ fontSize:12, color:"var(--text-3)" }}>Lưu vào kho từ vựng</div>
          </div>
          <button onClick={onClose} className="btn btn-ghost"><X size={17} /></button>
        </div>

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Row 1: word + phonetics */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={LabelStyle}>Từ tiếng Anh *</label>
              <input value={f.word} onChange={e=>setF({...f,word:e.target.value})}
                placeholder="Perseverance" className="input" style={{ borderRadius:"var(--r-md)" }} />
            </div>
            <div>
              <label style={LabelStyle}>Phiên âm</label>
              <input value={f.phonetics} onChange={e=>setF({...f,phonetics:e.target.value})}
                placeholder="/ˌpɜːrsɪˈvɪərəns/" className="input" style={{ borderRadius:"var(--r-md)" }} />
            </div>
          </div>

          {/* meaning */}
          <div>
            <label style={LabelStyle}>Nghĩa tiếng Việt *</label>
            <input value={f.meaning} onChange={e=>setF({...f,meaning:e.target.value})}
              placeholder="Sự kiên trì, bền bỉ" className="input" style={{ borderRadius:"var(--r-md)" }} />
          </div>

          {/* example */}
          <div>
            <label style={LabelStyle}>Câu ví dụ</label>
            <input value={f.example} onChange={e=>setF({...f,example:e.target.value})}
              placeholder="Success requires perseverance." className="input" style={{ borderRadius:"var(--r-md)" }} />
          </div>

          {/* Image URL */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <label style={LabelStyle}>Ảnh minh họa <span style={{ color:"var(--text-4)", fontWeight:400, textTransform:"none" }}>(URL – để trống sẽ tự động tìm)</span></label>
              {f.imageUrl && (
                <button type="button" onClick={() => setShowImgPreview(p=>!p)}
                  style={{ fontSize:11, color:"#9B8FF5", background:"none", border:"none",
                    cursor:"pointer", textDecoration:"underline" }}>
                  {showImgPreview ? "Ẩn preview" : "Xem preview"}
                </button>
              )}
            </div>
            <div style={{ position:"relative" }}>
              <LinkIcon size={13} color="var(--text-4)" style={{
                position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
              <input value={f.imageUrl} onChange={e=>setF({...f,imageUrl:e.target.value})}
                placeholder="https://images.unsplash.com/..." className="input"
                style={{ borderRadius:"var(--r-md)", paddingLeft:34 }} />
            </div>
            {showImgPreview && f.imageUrl && (
              <div style={{ marginTop:8 }}>
                <WordImage word={f.word} imageUrl={f.imageUrl} size={460} />
              </div>
            )}
            {!f.imageUrl && f.word && (
              <div style={{ marginTop:6, fontSize:11, color:"var(--text-4)" }}>
                💡 Sẽ tự tìm ảnh cho từ &ldquo;<strong style={{color:"var(--text-3)"}}>{f.word}</strong>&rdquo; trên Unsplash
              </div>
            )}
          </div>

          {/* Topics */}
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <label style={LabelStyle}>Chủ đề</label>
              {suggestedTopic && (
                <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#F59E0B", fontWeight:600 }}>
                  <Lightbulb size={11} /> Gợi ý: {TOPIC_EMOJI[suggestedTopic]} {suggestedTopic}
                </span>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
              {TOPIC_TAGS.map(tag => {
                const c = TOPICS[tag], active = f.topic===tag;
                const isSuggested = tag === suggestedTopic && !userPickedTopic;
                return (
                  <button key={tag} type="button" onClick={()=>{ setF({...f,topic:tag}); setUserPickedTopic(true); }}
                    style={{
                      padding:"7px 4px", borderRadius:10, fontSize:11, fontWeight:600,
                      border:`1.5px solid ${active ? c.border : isSuggested ? "rgba(245,158,11,0.35)" : "var(--border)"}`,
                      background:active ? c.bg : isSuggested ? "rgba(245,158,11,0.07)" : "transparent",
                      color:active ? c.color : isSuggested ? "#F59E0B" : "var(--text-3)",
                      cursor:"pointer", transition:"all 0.15s",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:3,
                      WebkitTapHighlightColor:"transparent",
                    }}>
                    <span style={{ fontSize:16 }}>{TOPIC_EMOJI[tag]}</span>
                    <span style={{ lineHeight:1.2, textAlign:"center", wordBreak:"break-word" }}>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary"
            style={{ width:"100%", marginTop:4, padding:"13px", fontSize:14,
              borderRadius:"var(--r-md)", opacity: busy ? 0.6 : 1 }}>
            {busy
              ? <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.4)",
                  borderTopColor:"white", borderRadius:"50%", animation:"spin 0.6s linear infinite" }} />
              : <><Plus size={16} /> Thêm vào kho từ vựng</>}
          </button>
        </form>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

/* ── Detail / Edit Modal ── */
function DetailModal({ word, onClose, onDelete, onUpdate }: {
  word:Word; onClose:()=>void; onDelete:(id:string)=>void; onUpdate:(id:string,u:Partial<Word>)=>void
}) {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({
    word: word.word, phonetics: word.phonetics,
    meaning: word.meaning, example: word.example,
    imageUrl: word.imageUrl || "",
  });
  const save = async () => {
    const updates = { ...f, imageUrl: f.imageUrl.trim() || undefined };
    await updateWord(word.id, updates);
    onUpdate(word.id, updates);
    setEditing(false);
  };
  const acc = word.reviewCount > 0 ? Math.round((word.correctCount/word.reviewCount)*100) : 0;
  const due = new Date(word.nextReview) <= new Date();

  const LabelStyle: React.CSSProperties = {
    fontSize:11, fontWeight:600, color:"var(--text-4)", marginBottom:5, display:"block",
    textTransform:"uppercase" as const, letterSpacing:"0.08em",
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{ position:"fixed", inset:0, zIndex:100, display:"flex",
        alignItems:"flex-end", justifyContent:"center", padding:"16px 16px 24px",
        background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }}
        exit={{ y:60, opacity:0 }} transition={{ type:"spring", damping:28, stiffness:280 }}
        style={{ width:"100%", maxWidth:500, background:"var(--bg-overlay)",
          border:"1px solid var(--border-hi)", borderRadius:"var(--r-xl)",
          padding:24, maxHeight:"90dvh", overflowY:"auto" }}>

        {/* Word hero */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ flex:1 }}>
            {editing
              ? <input value={f.word} onChange={e=>setF({...f,word:e.target.value})}
                  style={{ fontSize:24, fontWeight:800, background:"transparent",
                    borderBottom:"2px solid #7B68EE", outline:"none", color:"var(--text-1)", width:"100%" }} />
              : <div style={{ fontSize:24, fontWeight:800, color:"var(--text-1)" }}>{word.word}</div>}
            {editing
              ? <input value={f.phonetics} onChange={e=>setF({...f,phonetics:e.target.value})}
                  style={{ fontSize:13, color:"var(--text-3)", fontFamily:"monospace", background:"transparent",
                    border:"none", borderBottom:"1px solid var(--border)", outline:"none", marginTop:4 }} />
              : <div style={{ fontSize:13, color:"var(--text-3)", fontFamily:"monospace", marginTop:4 }}>
                  {word.phonetics}
                </div>}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ marginLeft:8 }}><X size={17} /></button>
        </div>

        <div style={{ marginBottom:16 }}><TopicBadge t={word.topic} /></div>

        {/* Image preview */}
        {!editing && (
          <div style={{ marginBottom:16 }}>
            <WordImage word={word.word} imageUrl={word.imageUrl} size={460} />
          </div>
        )}

        {/* Fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:18 }}>
          <div>
            <label style={LabelStyle}>Nghĩa tiếng Việt</label>
            {editing
              ? <input value={f.meaning} onChange={e=>setF({...f,meaning:e.target.value})}
                  className="input" style={{ borderRadius:"var(--r-sm)" }} />
              : <div style={{ fontSize:14, color:"var(--text-1)", fontWeight:600 }}>{word.meaning}</div>}
          </div>
          <div>
            <label style={LabelStyle}>Câu ví dụ</label>
            {editing
              ? <input value={f.example} onChange={e=>setF({...f,example:e.target.value})}
                  className="input" style={{ borderRadius:"var(--r-sm)" }} />
              : <div style={{ fontSize:14, color:"var(--text-2)", fontStyle:"italic" }}>
                  {word.example ? `"${word.example}"` : <span style={{color:"var(--text-4)"}}>Chưa có ví dụ</span>}
                </div>}
          </div>
          {editing && (
            <div>
              <label style={LabelStyle}>URL ảnh minh họa</label>
              <input value={f.imageUrl} onChange={e=>setF({...f,imageUrl:e.target.value})}
                placeholder="https://..." className="input" style={{ borderRadius:"var(--r-sm)" }} />
              {f.imageUrl && <div style={{marginTop:8}}><WordImage word={f.word} imageUrl={f.imageUrl} size={460}/></div>}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:18 }}>
          {[
            { label:"Lần ôn",    val:word.reviewCount,        c:"var(--text-1)" },
            { label:"Chính xác", val:`${acc}%`,               c:acc>=70?"#2DD4BF":acc>=40?"#F59E0B":"#FB7185" },
            { label:"Ôn tiếp",   val:due?"Hôm nay":new Date(word.nextReview).toLocaleDateString("vi-VN",{day:"numeric",month:"numeric"}),
              c:due?"#FB7185":"#2DD4BF" },
          ].map(s=>(
            <div key={s.label} style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
              borderRadius:"var(--r-sm)", padding:"12px 8px", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:800, color:s.c }}>{s.val}</div>
              <div style={{ fontSize:10, color:"var(--text-4)", marginTop:3, fontWeight:500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          {editing ? (
            <>
              <button onClick={()=>setEditing(false)} className="btn btn-secondary" style={{flex:1}}>Hủy</button>
              <button onClick={save} className="btn btn-success" style={{flex:1}}>
                <Check size={15} /> Lưu thay đổi
              </button>
            </>
          ) : (
            <>
              <button onClick={()=>setEditing(true)} className="btn btn-secondary" style={{flex:1}}>
                <Edit3 size={15} /> Chỉnh sửa
              </button>
              <button onClick={()=>{onDelete(word.id);onClose();}} className="btn btn-danger" style={{flex:1}}>
                <Trash2 size={15} /> Xóa từ
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Excel Import Modal ── */
interface ExcelRow {
  topic: string;
  word: string;
  phonetics: string;
  meaning: string;
  imageUrl: string;
  _valid: boolean;
  _error?: string;
}

function ExcelImportModal({ onClose, onImported }: { onClose: () => void; onImported: (count: number) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ExcelRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];

      // Auto-detect header row: skip rows until we find the data
      let startRow = 0;
      if (raw.length > 0) {
        const headerRow = raw[0].map(c => String(c).toLowerCase());
        // If first row looks like a header (contains "từ" or "word" or "meaning"), skip it
        if (headerRow.some(h => h.includes("từ") || h.includes("word") || h.includes("nghĩa") || h.includes("meaning") || h.includes("chủ") || h.includes("phiên"))) {
          startRow = 1;
        }
      }

      const parsed: ExcelRow[] = [];
      for (let i = startRow; i < raw.length; i++) {
        const r = raw[i];
        if (!r || r.every(c => !String(c).trim())) continue; // skip empty rows
        const topic   = String(r[0] ?? "").trim();
        const word    = String(r[1] ?? "").trim();
        const phonetics = String(r[2] ?? "").trim();
        const meaning = String(r[3] ?? "").trim();
        const imageUrl = String(r[4] ?? "").trim();

        const _valid = word.length > 0 && meaning.length > 0;
        const _error = !word ? "Thiếu từ tiếng Anh" : !meaning ? "Thiếu nghĩa tiếng Việt" : undefined;
        parsed.push({ topic, word, phonetics, meaning, imageUrl, _valid, _error });
      }
      setRows(parsed);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert("Chỉ hỗ trợ file .xlsx, .xls hoặc .csv!");
      return;
    }
    setRows([]);
    setDone(false);
    setProgress(0);
    parseFile(f);
  };

  const validRows = rows.filter(r => r._valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    setProgress(0);
    let count = 0;
    for (let i = 0; i < validRows.length; i++) {
      const r = validRows[i];
      const topicTag = (TOPIC_TAGS.includes(r.topic as TopicTag) ? r.topic : suggestTopic(r.word, r.meaning) ?? "Khác") as TopicTag;
      try {
        await addWord({
          word: r.word,
          phonetics: r.phonetics,
          meaning: r.meaning,
          example: "",
          topic: topicTag,
          imageUrl: r.imageUrl || undefined,
        });
        count++;
      } catch { /* skip duplicates/errors */ }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }
    setImporting(false);
    setDone(true);
    onImported(count);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 680, maxHeight: "90dvh", display: "flex", flexDirection: "column",
          background: "#0E0E1A", border: "1px solid rgba(123,104,238,0.25)",
          borderRadius: "var(--r-xl)", overflow: "hidden" }}>

        {/* Modal Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileSpreadsheet size={20} color="#4ADE80" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>Nhập từ vựng từ Excel</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Hỗ trợ .xlsx, .xls, .csv · Cột: Chủ đề | Từ Anh | Phiên âm | Nghĩa Việt | Link ảnh</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-4)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            style={{
              padding: "28px 20px", borderRadius: "var(--r-lg)", textAlign: "center", cursor: "pointer",
              border: `2px dashed ${dragOver ? "#4ADE80" : "rgba(123,104,238,0.3)"}`,
              background: dragOver ? "rgba(74,222,128,0.07)" : "rgba(123,104,238,0.04)",
              transition: "all 0.2s ease",
            }}>
            <Upload size={28} color={dragOver ? "#4ADE80" : "#7B68EE"} style={{ margin: "0 auto 10px" }} />
            <div style={{ fontWeight: 700, color: "var(--text-1)", fontSize: 14 }}>Kéo thả file vào đây hoặc bấm để chọn</div>
            <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 4 }}>Hỗ trợ .xlsx, .xls, .csv</div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </div>

          {/* Format hint */}
          <div style={{ padding: "10px 14px", borderRadius: "var(--r-md)", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#F59E0B", lineHeight: 1.5 }}>
            <strong>📋 Định dạng file:</strong> Hàng đầu tiên là tiêu đề (sẽ tự bỏ qua). Từ hàng 2 trở đi: <br />
            <span style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>Chủ đề | Từ tiếng Anh | Phiên âm IPA | Nghĩa tiếng Việt | Link ảnh (tuỳ chọn)</span>
          </div>

          {/* Preview Table */}
          {rows.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
                  Xem trước: <span style={{ color: "#4ADE80" }}>{validRows.length} từ hợp lệ</span>
                  {rows.length - validRows.length > 0 && <span style={{ color: "#FB7185", marginLeft: 8 }}>{rows.length - validRows.length} lỗi</span>}
                </div>
              </div>

              <div style={{ maxHeight: 280, overflowY: "auto", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }}>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-3)", fontWeight: 600 }}>Trạng thái</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-3)", fontWeight: 600 }}>Từ tiếng Anh</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-3)", fontWeight: 600 }}>Nghĩa</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-3)", fontWeight: 600 }}>Chủ đề</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", color: "var(--text-3)", fontWeight: 600 }}>Phiên âm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: r._valid ? "transparent" : "rgba(251,113,133,0.04)" }}>
                        <td style={{ padding: "7px 10px" }}>
                          {r._valid
                            ? <CheckCircle2 size={14} color="#4ADE80" />
                            : <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#FB7185" }}><AlertCircle size={14} /><span style={{ fontSize: 10 }}>{r._error}</span></span>}
                        </td>
                        <td style={{ padding: "7px 10px", color: "var(--text-1)", fontWeight: 600 }}>{r.word || <span style={{ color: "var(--text-4)" }}>—</span>}</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-2)" }}>{r.meaning || <span style={{ color: "var(--text-4)" }}>—</span>}</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-3)" }}>{r.topic || <span style={{ color: "var(--text-4)" }}>Tự động</span>}</td>
                        <td style={{ padding: "7px 10px", color: "var(--text-4)", fontFamily: "monospace", fontSize: 11 }}>{r.phonetics}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Progress bar while importing */}
          {importing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div animate={{ width: `${progress}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#4ADE80,#2DD4BF)", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Đang nhập... {progress}%</div>
            </div>
          )}

          {/* Success message */}
          {done && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "14px", borderRadius: "var(--r-md)", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
              <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: 14 }}>Nhập thành công {validRows.length} từ vựng!</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Kho từ vựng đã được cập nhật tự động</div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: "11px" }}>Đóng</button>
          {!done && (
            <button onClick={handleImport} disabled={validRows.length === 0 || importing} className="btn btn-primary"
              style={{ flex: 2, padding: "11px", background: validRows.length > 0 ? "linear-gradient(135deg,#4ADE80,#2DD4BF)" : undefined, color: validRows.length > 0 ? "#0A1A10" : undefined }}>
              {importing ? `Đang nhập ${progress}%...` : `Nhập ${validRows.length} từ vào Supabase`}
            </button>
          )}
          {done && (
            <button onClick={() => { setRows([]); setDone(false); }} className="btn btn-secondary" style={{ flex: 2, padding: "11px" }}>
              Nhập file khác
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Duplicate Cleanup Modal ── */
function DuplicateCleanupModal({ words, onClose, onCleaned }: {
  words: Word[];
  onClose: () => void;
  onCleaned: (deletedIds: string[]) => void;
}) {
  // Group words by normalized word string (lowercase, trimmed)
  const groups = useMemo(() => {
    const map = new Map<string, Word[]>();
    words.forEach(w => {
      const key = w.word.toLowerCase().trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    // Only keep groups with duplicates
    const dupes: { key: string; items: Word[] }[] = [];
    map.forEach((items, key) => {
      if (items.length > 1) {
        // Sort: keep the one with the most data (highest difficulty or most reviews) as "keeper"
        const sorted = [...items].sort((a, b) => {
          const scoreA = a.difficulty * 10 + a.reviewCount + (a.imageUrl ? 5 : 0) + (a.example ? 3 : 0);
          const scoreB = b.difficulty * 10 + b.reviewCount + (b.imageUrl ? 5 : 0) + (b.example ? 3 : 0);
          return scoreB - scoreA;
        });
        dupes.push({ key, items: sorted });
      }
    });
    return dupes.sort((a, b) => a.key.localeCompare(b.key));
  }, [words]);

  const [selectedToDelete, setSelectedToDelete] = useState<Set<string>>(() => {
    // Auto-select all duplicates (all except the first/best in each group)
    const ids = new Set<string>();
    const map = new Map<string, Word[]>();
    words.forEach(w => {
      const key = w.word.toLowerCase().trim();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    });
    map.forEach(items => {
      if (items.length > 1) {
        const sorted = [...items].sort((a, b) => {
          const scoreA = a.difficulty * 10 + a.reviewCount + (a.imageUrl ? 5 : 0) + (a.example ? 3 : 0);
          const scoreB = b.difficulty * 10 + b.reviewCount + (b.imageUrl ? 5 : 0) + (b.example ? 3 : 0);
          return scoreB - scoreA;
        });
        sorted.slice(1).forEach(w => ids.add(w.id));
      }
    });
    return ids;
  });

  const [deleting, setDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const toggleId = (id: string) => {
    setSelectedToDelete(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    const ids = Array.from(selectedToDelete);
    if (ids.length === 0) return;
    setDeleting(true);
    setProgress(0);
    for (let i = 0; i < ids.length; i++) {
      await deleteWord(ids[i]);
      setProgress(Math.round(((i + 1) / ids.length) * 100));
    }
    setDeleting(false);
    setDone(true);
    onCleaned(ids);
  };

  const totalDupeCount = groups.reduce((s, g) => s + g.items.length - 1, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 700, maxHeight: "90dvh", display: "flex", flexDirection: "column",
          background: "#0E0E1A", border: "1px solid rgba(251,113,133,0.25)",
          borderRadius: "var(--r-xl)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(251,113,133,0.15)", border: "1px solid rgba(251,113,133,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wrench size={20} color="#FB7185" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>Dọn dẹp từ vựng trùng lặp</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              {groups.length > 0
                ? <><span style={{ color: "#FB7185", fontWeight: 700 }}>{groups.length} từ</span> bị trùng · <span style={{ color: "#FB7185", fontWeight: 700 }}>{totalDupeCount} bản sao</span> sẽ được xóa</>
                : "Không phát hiện từ vựng trùng lặp"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-4)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

          {groups.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48 }}>✨</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Kho từ vựng sạch sẽ!</div>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>Không tìm thấy từ vựng nào bị trùng lặp.</div>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div style={{ padding: "10px 14px", borderRadius: "var(--r-md)", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: "#F59E0B", lineHeight: 1.6 }}>
                💡 Hệ thống tự động chọn bản sao tốt nhất (có nhiều dữ liệu nhất) để <strong>giữ lại</strong>. Các bản còn lại được <strong>đánh dấu xóa</strong>. Bạn có thể điều chỉnh trước khi xóa.
              </div>

              {/* Bulk select */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  const allDupeIds = new Set<string>();
                  groups.forEach(g => g.items.slice(1).forEach(w => allDupeIds.add(w.id)));
                  setSelectedToDelete(allDupeIds);
                }} className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 12px" }}>Chọn tất cả bản sao</button>
                <button onClick={() => setSelectedToDelete(new Set())} className="btn btn-secondary" style={{ fontSize: 11, padding: "5px 12px" }}>Bỏ chọn tất cả</button>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center" }}>
                  Đã chọn xóa: <strong style={{ color: "#FB7185", marginLeft: 4 }}>{selectedToDelete.size} từ</strong>
                </span>
              </div>

              {/* Duplicate groups */}
              {groups.map((g, gi) => (
                <div key={g.key} style={{ borderRadius: "var(--r-md)", border: "1px solid var(--border)", overflow: "hidden" }}>
                  {/* Group header */}
                  <div style={{ padding: "10px 14px", background: "rgba(251,113,133,0.06)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Copy size={13} color="#FB7185" />
                    <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text-1)" }}>{g.items[0].word}</span>
                    <span style={{ fontSize: 11, color: "#FB7185", background: "rgba(251,113,133,0.15)", padding: "2px 7px", borderRadius: 99 }}>{g.items.length} bản</span>
                  </div>

                  {/* Each copy */}
                  {g.items.map((w, wi) => {
                    const isKeeper = wi === 0;
                    const isChecked = selectedToDelete.has(w.id);
                    return (
                      <div key={w.id} style={{
                        padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 12,
                        background: isKeeper ? "rgba(74,222,128,0.04)" : isChecked ? "rgba(251,113,133,0.05)" : "transparent",
                        borderBottom: wi < g.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      }}>
                        {/* Checkbox or keeper badge */}
                        {isKeeper ? (
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <Check size={12} color="#4ADE80" />
                          </div>
                        ) : (
                          <input type="checkbox" checked={isChecked} onChange={() => toggleId(w.id)}
                            style={{ width: 16, height: 16, marginTop: 4, flexShrink: 0, accentColor: "#FB7185", cursor: "pointer" }} />
                        )}

                        {/* Word info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {isKeeper && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "rgba(74,222,128,0.15)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.3)" }}>✓ GIỮ LẠI</span>}
                            {!isKeeper && isChecked && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "rgba(251,113,133,0.15)", color: "#FB7185", border: "1px solid rgba(251,113,133,0.3)" }}>✗ XÓA</span>}
                            {!isKeeper && !isChecked && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99, background: "rgba(255,255,255,0.05)", color: "var(--text-4)" }}>BỎ CHỌN</span>}
                            <span style={{ fontSize: 11, color: "var(--text-4)", fontFamily: "monospace" }}>{w.phonetics}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 3 }}>{w.meaning}</div>
                          {w.example && <div style={{ fontSize: 11, color: "var(--text-4)", fontStyle: "italic", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{w.example}"</div>}
                          <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10, color: "var(--text-4)" }}>Chủ đề: {w.topic}</span>
                            <span style={{ fontSize: 10, color: "var(--text-4)" }}>Độ thuộc: {w.difficulty}/5</span>
                            <span style={{ fontSize: 10, color: "var(--text-4)" }}>Ôn {w.reviewCount} lần</span>
                            <span style={{ fontSize: 10, color: "var(--text-4)" }}>Thêm: {new Date(w.createdAt).toLocaleDateString("vi-VN")}</span>
                            {w.imageUrl && <span style={{ fontSize: 10, color: "#2DD4BF" }}>🖼 Có ảnh</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {/* Progress */}
          {deleting && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div animate={{ width: `${progress}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#FB7185,#F472B6)", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Đang xóa... {progress}%</div>
            </div>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "14px", borderRadius: "var(--r-md)", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🧹</div>
              <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: 14 }}>Đã dọn sạch {selectedToDelete.size} từ trùng lặp!</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Kho từ vựng đã được cập nhật</div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, padding: "11px" }}>
            {done ? "Đóng" : "Hủy"}
          </button>
          {!done && groups.length > 0 && (
            <button onClick={handleDelete} disabled={selectedToDelete.size === 0 || deleting} className="btn"
              style={{
                flex: 2, padding: "11px", fontWeight: 700, fontSize: 14,
                background: selectedToDelete.size > 0 ? "linear-gradient(135deg,#FB7185,#F43F5E)" : "var(--bg-overlay)",
                color: selectedToDelete.size > 0 ? "white" : "var(--text-4)",
                border: "none", borderRadius: "var(--r-md)", cursor: selectedToDelete.size > 0 ? "pointer" : "not-allowed"
              }}>
              {deleting ? `Đang xóa ${progress}%...` : `🗑 Xóa ${selectedToDelete.size} từ trùng lặp`}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Image Fix Modal ── */
function ImageFixModal({ words, onClose, onUpdated }: {
  words: Word[];
  onClose: () => void;
  onUpdated: (updates: { id: string; imageUrl: string }[]) => void;
}) {
  // Phase 1: scan all words with imageUrl to detect broken ones
  const [scanning, setScanning] = useState(true);
  const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState(0);

  const noImageWords = useMemo(() => words.filter(w => !w.imageUrl), [words]);
  const hasImageWords = useMemo(() => words.filter(w => !!w.imageUrl), [words]);

  useEffect(() => {
    if (hasImageWords.length === 0) { setScanning(false); return; }
    let completed = 0;
    const broken = new Set<string>();
    hasImageWords.forEach(w => {
      const img = new window.Image();
      const finish = () => {
        completed++;
        setScanProgress(Math.round((completed / hasImageWords.length) * 100));
        if (completed === hasImageWords.length) { setBrokenIds(new Set(broken)); setScanning(false); }
      };
      img.onload = finish;
      img.onerror = () => { broken.add(w.id); finish(); };
      img.src = w.imageUrl!;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Combined list: no image + broken image
  const fixWords = useMemo(() => [
    ...noImageWords,
    ...words.filter(w => brokenIds.has(w.id)),
  ], [words, noImageWords, brokenIds]);

  // urlMap: broken ones pre-fill with existing URL so user can replace
  const [urlMap, setUrlMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const m: Record<string, string> = {};
    noImageWords.forEach(w => { if (!(w.id in m)) m[w.id] = ""; });
    words.filter(w => brokenIds.has(w.id)).forEach(w => { m[w.id] = w.imageUrl ?? ""; });
    setUrlMap(prev => ({ ...m, ...prev }));
  }, [noImageWords, brokenIds, words]);

  const [previewFailed, setPreviewFailed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const filledCount = Object.values(urlMap).filter(v => v.trim().length > 0).length;

  const handleSave = async () => {
    const entries = Object.entries(urlMap).filter(([, url]) => url.trim().length > 0);
    if (entries.length === 0) return;
    setSaving(true);
    setProgress(0);
    const updates: { id: string; imageUrl: string }[] = [];
    for (let i = 0; i < entries.length; i++) {
      const [id, imageUrl] = entries[i];
      await updateWord(id, { imageUrl: imageUrl.trim() });
      updates.push({ id, imageUrl: imageUrl.trim() });
      setProgress(Math.round(((i + 1) / entries.length) * 100));
    }
    setSaving(false);
    setDone(true);
    onUpdated(updates);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 680, maxHeight: "90dvh", display: "flex", flexDirection: "column",
          background: "#0E0E1A", border: "1px solid rgba(45,212,191,0.25)",
          borderRadius: "var(--r-xl)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(45,212,191,0.15)", border: "1px solid rgba(45,212,191,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ImageIcon size={20} color="#2DD4BF" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-1)" }}>Xử lí Thêm Ảnh Hàng loạt</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
              {scanning
                ? <span>Đang quét ảnh lỗi... <span style={{ color: "#F59E0B", fontWeight: 700 }}>{scanProgress}%</span></span>
                : <><span style={{ color: "#FB7185", fontWeight: 700 }}>{noImageWords.length} từ</span> chưa có ảnh · <span style={{ color: "#F59E0B", fontWeight: 700 }}>{brokenIds.size} ảnh lỗi</span> · Tổng: <span style={{ color: "#2DD4BF", fontWeight: 700 }}>{fixWords.length}</span> từ cần xử lí</>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-4)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Scanning state */}
          {scanning && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "32px 0" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid rgba(45,212,191,0.15)", borderTop: "3px solid #2DD4BF", animation: "spin 1s linear infinite" }} />
              <div style={{ fontWeight: 700, color: "var(--text-2)", fontSize: 14 }}>Đang quét ảnh bị lỗi...</div>
              <div style={{ fontSize: 12, color: "var(--text-4)" }}>Kiểm tra {hasImageWords.length} ảnh · {scanProgress}% hoàn thành</div>
              <div style={{ width: "100%", maxWidth: 320, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div animate={{ width: `${scanProgress}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#2DD4BF,#38BDF8)", borderRadius: 99 }} />
              </div>
            </div>
          )}

          {!scanning && fixWords.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 0", textAlign: "center" }}>
              <div style={{ fontSize: 48 }}>🖼️</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-1)" }}>Tất cả ảnh đều ổn!</div>
              <div style={{ fontSize: 13, color: "var(--text-3)" }}>Không phát hiện ảnh lỗi hay từ thiếu ảnh.</div>
            </div>
          ) : !scanning && (
            <>
              <div style={{ padding: "10px 14px", borderRadius: "var(--r-md)", background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.2)", fontSize: 12, color: "#2DD4BF", lineHeight: 1.6 }}>
                💡 Dán link ảnh mới vào ô tương ứng. Ảnh lỗi đã điền sẵn URL cũ để bạn thay thế. Để trống = bỏ qua.
              </div>

              {fixWords.map((w) => {
                const isBroken = brokenIds.has(w.id);
                const url = urlMap[w.id] ?? "";
                const hasUrl = url.trim().length > 0;
                const failed = previewFailed[w.id];
                const previewSrc = url.trim() || (isBroken ? w.imageUrl : null);
                return (
                  <div key={w.id} style={{
                    borderRadius: "var(--r-md)", border: "1px solid",
                    borderColor: hasUrl && !failed ? "rgba(45,212,191,0.35)" : failed ? "rgba(251,113,133,0.35)" : isBroken ? "rgba(245,158,11,0.35)" : "var(--border)",
                    background: hasUrl && !failed ? "rgba(45,212,191,0.05)" : isBroken ? "rgba(245,158,11,0.04)" : "var(--bg-raised)",
                    padding: "12px 14px", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    {/* Thumbnail — position:relative bắt buộc để badge absolute không bay ra ngoài */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 9, flexShrink: 0,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden", position: "relative",
                    }}>
                      {previewSrc && !failed ? (
                        <img
                          src={previewSrc}
                          alt={w.word}
                          onError={() => setPreviewFailed(p => ({ ...p, [w.id]: true }))}
                          onLoad={() => setPreviewFailed(p => { const next = { ...p }; delete next[w.id]; return next; })}
                          style={{ width: "100%", height: "100%", objectFit: "cover",
                            filter: isBroken && !hasUrl ? "grayscale(0.6) opacity(0.4)" : "none" }}
                        />
                      ) : failed ? (
                        <AlertCircle size={20} color="#FB7185" />
                      ) : (
                        <ImageIcon size={20} color="var(--text-4)" />
                      )}
                      {isBroken && (
                        <div style={{ position: "absolute", bottom: 2, right: 2,
                          background: "#F59E0B", borderRadius: 3, padding: "0px 3px",
                          fontSize: 7, fontWeight: 900, color: "#1A0F00", lineHeight: "14px" }}>
                          LỖI
                        </div>
                      )}
                    </div>

                    {/* Word name + meaning (fixed width) */}
                    <div style={{ width: 130, flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {w.word}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {w.meaning}
                      </div>
                      {isBroken
                        ? <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)", display: "inline-block", marginTop: 3 }}>⚠ Ảnh lỗi</span>
                        : <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 99, background: "rgba(148,163,184,0.1)", color: "var(--text-4)", border: "1px solid rgba(148,163,184,0.15)", display: "inline-block", marginTop: 3 }}>Chưa có ảnh</span>}
                    </div>

                    {/* URL input — flex:1 chiếm phần còn lại */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          setUrlMap(prev => ({ ...prev, [w.id]: e.target.value }));
                          if (previewFailed[w.id]) setPreviewFailed(p => { const next = { ...p }; delete next[w.id]; return next; });
                        }}
                        placeholder={isBroken ? "Dán URL ảnh mới..." : "Dán địa chỉ ảnh..."}
                        className="input"
                        style={{
                          width: "100%", fontSize: 12, padding: "7px 11px",
                          borderRadius: "var(--r-sm)", boxSizing: "border-box",
                          borderColor: failed ? "rgba(251,113,133,0.5)"
                            : hasUrl && !failed ? "rgba(45,212,191,0.5)"
                            : isBroken ? "rgba(245,158,11,0.35)" : undefined,
                        }}
                      />
                      {failed && <div style={{ fontSize: 10, color: "#FB7185", marginTop: 3 }}>⚠ Link không hợp lệ</div>}
                    </div>

                    {/* Status icon */}
                    <div style={{ flexShrink: 0 }}>
                      {hasUrl && !failed && <CheckCircle2 size={16} color="#2DD4BF" />}
                      {failed && <AlertCircle size={16} color="#FB7185" />}
                      {!hasUrl && !failed && <div style={{ width: 16 }} />}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* Progress */}
          {saving && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div animate={{ width: `${progress}%` }} style={{ height: "100%", background: "linear-gradient(90deg,#2DD4BF,#38BDF8)", borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Đang lưu... {progress}%</div>
            </div>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "14px", borderRadius: "var(--r-md)", background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontWeight: 700, color: "#2DD4BF", fontSize: 14 }}>Đã thêm ảnh cho {filledCount} từ vựng!</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Ảnh sẽ hiển thị ngay trong thẻ Flashcard</div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: "var(--text-4)", flex: 1 }}>
            {filledCount > 0 ? <span style={{ color: "#2DD4BF", fontWeight: 600 }}>{filledCount} ảnh sẵn sàng lưu</span> : "Chưa có ảnh nào được dán"}
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: "10px 20px" }}>{done ? "Đóng" : "Hủy"}</button>
          {!done && !scanning && fixWords.length > 0 && (
            <button onClick={handleSave} disabled={filledCount === 0 || saving} className="btn btn-primary"
              style={{ padding: "10px 24px",
                background: filledCount > 0 ? "linear-gradient(135deg,#2DD4BF,#38BDF8)" : undefined,
                color: filledCount > 0 ? "#071E20" : undefined,
                opacity: filledCount === 0 ? 0.5 : 1 }}>
              {saving ? `Đang lưu ${progress}%...` : `✓ Xác nhận thêm ${filledCount} ảnh`}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function VocabularyPage() {
  const [words, setWords]         = useState<Word[]>([]);
  const [q, setQ]                 = useState("");
  const [topic, setTopic]         = useState<TopicTag|"Tất cả">("Tất cả");
  const [sort, setSort]           = useState<"createdAt"|"word"|"difficulty">("createdAt");
  const [asc, setAsc]             = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showCleanup, setShowCleanup] = useState(false);
  const [showImageFix, setShowImageFix] = useState(false);
  const [showFixMenu, setShowFixMenu] = useState(false);
  const [selected, setSelected]   = useState<Word|null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { getWords().then(setWords); }, []);
  useEffect(() => {
    if (!showFixMenu) return;
    const close = () => setShowFixMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showFixMenu]);

  const list = useMemo(() => {
    let w = [...words];
    if (q) w = w.filter(x => x.word.toLowerCase().includes(q.toLowerCase()) || x.meaning.toLowerCase().includes(q.toLowerCase()));
    if (topic !== "Tất cả") w = w.filter(x => x.topic === topic);
    w.sort((a,b) => {
      const cmp = sort==="word" ? a.word.localeCompare(b.word)
                : sort==="difficulty" ? a.difficulty-b.difficulty
                : new Date(a.createdAt).getTime()-new Date(b.createdAt).getTime();
      return asc ? cmp : -cmp;
    });
    return w;
  }, [words,q,topic,sort,asc]);

  const toggleSort = (k: typeof sort) => { if(sort===k) setAsc(!asc); else {setSort(k);setAsc(true);} };
  const handleAdd    = (w:Word) => setWords(p=>[...p,w]);
  const handleDelete = async (id:string) => { await deleteWord(id); setWords(p=>p.filter(w=>w.id!==id)); };
  const handleUpdate = (id:string,u:Partial<Word>) => setWords(p=>p.map(w=>w.id===id?{...w,...u}:w));

  const SortBtn = ({ k, label }: { k:typeof sort; label:string }) => (
    <button onClick={()=>toggleSort(k)} style={{
      background:"none", border:"none", cursor:"pointer",
      display:"flex", alignItems:"center", gap:3,
      fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase",
      color: sort===k ? "var(--text-1)" : "var(--text-3)", padding:0,
    }}>
      {label}
      {sort===k ? (asc ? <ChevronUp size={11}/> : <ChevronDown size={11}/>) : <ChevronDown size={11} opacity={0.3}/>}
    </button>
  );

  const COL: CSSProperties = { gridTemplateColumns:"2fr 1.2fr 2fr 1fr 1.4fr 0.8fr 64px" };

  return (
    <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px 24px" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <BookOpen size={22} color="#7B68EE" />
            <h1 style={{ fontSize:22, fontWeight:800, color:"var(--text-1)" }}>Kho từ vựng</h1>
          </div>
          <div style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>
            {words.length} từ đã lưu · {words.filter(w=>w.difficulty>=3).length} từ đã thuộc
            · {words.filter(w=>w.imageUrl).length} từ có ảnh
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          {/* Sửa lỗi dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowFixMenu(m => !m)}
              className="btn btn-secondary"
              style={{ padding: "10px 16px", border: "1.5px solid rgba(251,113,133,0.35)", color: "#FB7185", background: "rgba(251,113,133,0.07)", gap: 6 }}
            >
              <Wrench size={16} /> Sửa lỗi <ChevDown size={13} style={{ opacity: 0.7, transform: showFixMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
              {showFixMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 100,
                    background: "#131320", border: "1px solid rgba(251,113,133,0.25)",
                    borderRadius: "var(--r-md)", overflow: "hidden", minWidth: 230,
                    boxShadow: "0 16px 40px rgba(0,0,0,0.6)"
                  }}
                >
                  <button
                    onClick={() => { setShowCleanup(true); setShowFixMenu(false); }}
                    style={{
                      width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.06)", WebkitTapHighlightColor: "transparent"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(251,113,133,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(251,113,133,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Copy size={15} color="#FB7185" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Xử lý từ trùng lặp</div>
                      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 1 }}>Tìm & xóa bản sao, giữ lại 1 từ</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setShowImageFix(true); setShowFixMenu(false); }}
                    style={{
                      width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                      background: "none", border: "none", cursor: "pointer", textAlign: "left",
                      WebkitTapHighlightColor: "transparent"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(45,212,191,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(45,212,191,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ImageIcon size={15} color="#2DD4BF" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-1)" }}>Xử lý thêm ảnh</div>
                      <div style={{ fontSize: 11, color: "var(--text-4)", marginTop: 1 }}>Dán URL ảnh hàng loạt cho từ chưa có ảnh</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => setShowImport(true)} className="btn btn-secondary" style={{ padding: "10px 16px", border: "1.5px solid rgba(74,222,128,0.35)", color: "#4ADE80", background: "rgba(74,222,128,0.07)" }}>
            <FileSpreadsheet size={16} /> Nhập Excel
          </button>
          <button onClick={()=>setShowAdd(true)} className="btn btn-primary" style={{ padding:"10px 18px" }}>
            <Plus size={16}/> Thêm từ
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:200 }}>
          <Search size={15} color="var(--text-4)" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm từ hoặc nghĩa..."
            className="input" style={{ paddingLeft:38, borderRadius:"var(--r-md)" }} />
        </div>
        <button onClick={()=>setShowFilter(!showFilter)} className="btn"
          style={{ padding:"10px 16px",
            background: showFilter ? "var(--brand-dim)" : "var(--bg-overlay)",
            color: showFilter ? "#9B8FF5" : "var(--text-2)",
            border: `1.5px solid ${showFilter ? "rgba(123,104,238,0.35)" : "var(--border-med)"}` }}>
          {topic !== "Tất cả" ? <TopicBadge t={topic as TopicTag} /> : "Lọc chủ đề"}
        </button>
      </div>

      <AnimatePresence>
        {showFilter && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }} style={{ overflow:"hidden", marginBottom:12 }}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, paddingBottom:4 }}>
              {(["Tất cả", ...TOPIC_TAGS] as const).map(t => {
                const active = topic===t, c = t!=="Tất cả" ? TOPICS[t as TopicTag] : null;
                return (
                  <button key={t} onClick={()=>setTopic(t)}
                    style={{ padding:"5px 14px", borderRadius:99, fontSize:12, fontWeight:600,
                      border:`1.5px solid ${active?(c?.border??"var(--border-hi)"):"var(--border)"}`,
                      background:active?(c?.bg??"rgba(255,255,255,0.08)"):"transparent",
                      color:active?(c?.color??"var(--text-1)"):"var(--text-3)",
                      cursor:"pointer", transition:"all 0.15s" }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop Table ── */}
      <div className="vocab-table" style={{ borderRadius:"var(--r-lg)", overflow:"hidden",
        border:"1px solid var(--border)", background:"var(--bg-raised)" }}>
        {/* Header */}
        <div style={{ display:"grid", ...COL, padding:"12px 20px",
          background:"rgba(255,255,255,0.025)", borderBottom:"1px solid var(--border)" }}>
          <SortBtn k="word" label="Từ vựng" />
          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Phiên âm</span>
          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Nghĩa</span>
          <span style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Chủ đề</span>
          <SortBtn k="difficulty" label="Mức độ" />
          <SortBtn k="createdAt" label="Ngày" />
          <span />
        </div>

        {/* Rows */}
        <AnimatePresence>
          {list.map((w,i) => (
            <motion.div key={w.id}
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ delay: i*0.012 }}
              onClick={()=>setSelected(w)}
              style={{ display:"grid", ...COL, padding:"13px 20px", alignItems:"center",
                borderBottom:"1px solid var(--border)", cursor:"pointer", transition:"background 0.15s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(123,104,238,0.05)")}
              onMouseLeave={e=>(e.currentTarget.style.background="transparent")}
              className="vocab-row">

              {/* Word + image indicator */}
              <div style={{ display:"flex", alignItems:"center", gap:8, overflow:"hidden" }}>
                {w.imageUrl ? (
                  <div style={{ width:28, height:28, borderRadius:6, overflow:"hidden", flexShrink:0,
                    border:"1px solid var(--border)" }}>
                    <img src={w.imageUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                ) : (
                  <div style={{ width:28, height:28, borderRadius:6, flexShrink:0,
                    background:TOPIC_GRADIENTS[w.topic],
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ImageIcon size={12} color="rgba(255,255,255,0.5)" />
                  </div>
                )}
                <span style={{ fontWeight:700, fontSize:14, color:"var(--text-1)",
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {w.word}
                </span>
              </div>

              <span style={{ fontSize:12, fontFamily:"monospace", color:"var(--text-3)", overflow:"hidden", textOverflow:"ellipsis" }}>
                {w.phonetics}
              </span>
              <span style={{ fontSize:13, color:"var(--text-2)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {w.meaning}
              </span>
              <div><TopicBadge t={w.topic} /></div>
              <div><DiffDots v={w.difficulty} /></div>
              <span style={{ fontSize:12, color:"var(--text-3)" }}>
                {new Date(w.createdAt).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"2-digit"})}
              </span>

              <div style={{ display:"flex", gap:4, justifyContent:"flex-end" }} className="row-actions">
                <button onClick={e=>{e.stopPropagation();setSelected(w);}} className="btn btn-ghost" style={{padding:6}}>
                  <Edit3 size={13}/>
                </button>
                <button onClick={e=>{e.stopPropagation();handleDelete(w.id);}} className="btn btn-ghost"
                  style={{padding:6}}
                  onMouseEnter={e=>(e.currentTarget.style.color="#FB7185")}
                  onMouseLeave={e=>(e.currentTarget.style.color="")}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {list.length === 0 && (
          <div style={{ padding:"64px 24px", textAlign:"center" }}>
            <BookOpen size={40} color="var(--text-4)" style={{ margin:"0 auto 12px" }} />
            <div style={{ color:"var(--text-3)", fontWeight:600 }}>
              {q ? `Không tìm thấy "${q}"` : "Chưa có từ vựng nào"}
            </div>
            <div style={{ color:"var(--text-4)", fontSize:12, marginTop:4 }}>Bấm "Thêm từ" để bắt đầu!</div>
          </div>
        )}
      </div>

      {/* ── Mobile Cards ── */}
      <div className="vocab-cards" style={{ display:"none", flexDirection:"column", gap:10 }}>
        <AnimatePresence>
          {list.map((w,i)=>(
            <motion.div key={w.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              transition={{delay:i*0.04}} onClick={()=>setSelected(w)}
              style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
                borderRadius:"var(--r-lg)", overflow:"hidden", cursor:"pointer" }}>
              {/* Image strip if available */}
              {w.imageUrl && (
                <div style={{ height:100, overflow:"hidden" }}>
                  <img src={w.imageUrl} alt={w.word}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
              )}
              <div style={{ padding:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:3 }}>
                      <span style={{ fontWeight:800, fontSize:15, color:"var(--text-1)" }}>{w.word}</span>
                      <TopicBadge t={w.topic} />
                    </div>
                    <div style={{ fontSize:12, color:"var(--text-4)", fontFamily:"monospace", marginBottom:4 }}>{w.phonetics}</div>
                    <div style={{ fontSize:13, color:"var(--text-2)" }}>{w.meaning}</div>
                  </div>
                  <DiffDots v={w.difficulty} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length===0 && (
          <div style={{ padding:"48px 0", textAlign:"center", color:"var(--text-3)" }}>Chưa có từ vựng nào</div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAdd && <AddModal onClose={()=>setShowAdd(false)} onAdd={handleAdd} />}
        {selected && <DetailModal word={selected} onClose={()=>setSelected(null)} onDelete={handleDelete} onUpdate={handleUpdate} />}
        {showImport && (
          <ExcelImportModal
            onClose={() => setShowImport(false)}
            onImported={(count) => {
              getWords().then(setWords);
              if (count > 0) setTimeout(() => setShowImport(false), 2500);
            }}
          />
        )}
        {showCleanup && (
          <DuplicateCleanupModal
            words={words}
            onClose={() => setShowCleanup(false)}
            onCleaned={(deletedIds) => {
              setWords(prev => prev.filter(w => !deletedIds.includes(w.id)));
            }}
          />
        )}
        {showImageFix && (
          <ImageFixModal
            words={words}
            onClose={() => setShowImageFix(false)}
            onUpdated={(updates) => {
              setWords(prev => prev.map(w => {
                const upd = updates.find(u => u.id === w.id);
                return upd ? { ...w, imageUrl: upd.imageUrl } : w;
              }));
              setTimeout(() => setShowImageFix(false), 2500);
            }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .vocab-row .row-actions { opacity: 0; transition: opacity 0.15s; }
        .vocab-row:hover .row-actions { opacity: 1; }
        @media (max-width: 768px) {
          .vocab-table { display: none !important; }
          .vocab-cards { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
