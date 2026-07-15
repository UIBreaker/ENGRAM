"use client";
import { useEffect, useState, useMemo, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit3, X, Check, BookOpen, ChevronDown, ChevronUp, Sparkles, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { getWords, addWord, deleteWord, updateWord } from "@/lib/db";
import { Word, TopicTag, TOPIC_TAGS } from "@/lib/types";

/* ── Topic config ── */
type TC = { color: string; bg: string; border: string; dot: string };
const TOPICS: Record<TopicTag, TC> = {
  "Công việc": { color: "#93C5FD", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.28)",  dot: "#60A5FA" },
  "Lập trình": { color: "#6EE7B7", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)",  dot: "#34D399" },
  "Đời sống":  { color: "#C4B5FD", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.28)", dot: "#A78BFA" },
  "Du lịch":   { color: "#FCD34D", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)",  dot: "#FBBF24" },
  "Học thuật": { color: "#FCA88A", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.28)",  dot: "#F97316" },
  "Khác":      { color: "#CBD5E1", bg: "rgba(148,163,184,0.1)",  border: "rgba(148,163,184,0.2)",  dot: "#94A3B8" },
};

const DIFF       = ["Mới","Đang học","Tạm nhớ","Khá thuộc","Thuộc","Rất thuộc"];
const DIFF_COLOR = ["var(--text-4)","#F59E0B","#7B68EE","#2DD4BF","#2DD4BF","#2DD4BF"];

const TOPIC_GRADIENTS: Record<TopicTag, string> = {
  "Công việc": "linear-gradient(135deg,#1e3a5f,#2563eb)",
  "Lập trình": "linear-gradient(135deg,#064e3b,#059669)",
  "Đời sống":  "linear-gradient(135deg,#3b1d8a,#7c3aed)",
  "Du lịch":   "linear-gradient(135deg,#78350f,#d97706)",
  "Học thuật": "linear-gradient(135deg,#7c2d12,#ea580c)",
  "Khác":      "linear-gradient(135deg,#1e293b,#475569)",
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
            <label style={LabelStyle}>Chủ đề</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {TOPIC_TAGS.map(tag => {
                const c = TOPICS[tag], active = f.topic===tag;
                return (
                  <button key={tag} type="button" onClick={()=>setF({...f,topic:tag})}
                    style={{ padding:"5px 12px", borderRadius:99, fontSize:12, fontWeight:600,
                      border:`1.5px solid ${active?c.border:"var(--border)"}`,
                      background:active?c.bg:"transparent", color:active?c.color:"var(--text-3)",
                      cursor:"pointer", transition:"all 0.15s" }}>
                    {tag}
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

/* ── Main Page ── */
export default function VocabularyPage() {
  const [words, setWords]         = useState<Word[]>([]);
  const [q, setQ]                 = useState("");
  const [topic, setTopic]         = useState<TopicTag|"Tất cả">("Tất cả");
  const [sort, setSort]           = useState<"createdAt"|"word"|"difficulty">("createdAt");
  const [asc, setAsc]             = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [selected, setSelected]   = useState<Word|null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => { getWords().then(setWords); }, []);

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
        <button onClick={()=>setShowAdd(true)} className="btn btn-primary" style={{ padding:"10px 18px" }}>
          <Plus size={16}/> Thêm từ
        </button>
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
