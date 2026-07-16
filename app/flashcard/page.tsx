"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { BrainCircuit, XCircle, Zap, CheckCircle2, ArrowLeft, Trophy, RotateCcw, Volume2, ChevronRight } from "lucide-react";
import { getDueWords, applyRating, updateWord, recordSession } from "@/lib/db";
import { Word, FlashcardRating } from "@/lib/types";
import Link from "next/link";

/* ── Progress ── */
function Progress({ cur, tot }: { cur:number; tot:number }) {
  return (
    <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
      <motion.div style={{ height:"100%", background:"linear-gradient(90deg,#7B68EE,#E879A0)",
        borderRadius:99 }}
        initial={{ width:0 }}
        animate={{ width:`${tot>0?(cur/tot)*100:0}%` }}
        transition={{ duration:0.5, ease:"easeOut" }} />
    </div>
  );
}

/* ── Card Face ── */
function CardFront({ word }: { word:Word }) {
  return (
    <div style={{
      width:"100%", height:"100%",
      background:"linear-gradient(160deg, #16162E 0%, #111124 100%)",
      border:"1px solid rgba(123,104,238,0.18)",
      borderRadius:"var(--r-xl)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"40px 32px", cursor:"pointer", position:"relative", overflow:"hidden",
    }}>
      {/* ambient glow */}
      <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
        width:"60%", height:"50%",
        background:"radial-gradient(ellipse, rgba(123,104,238,0.1) 0%, transparent 70%)" }} />

      <div style={{ width:48, height:48, borderRadius:16,
        background:"rgba(123,104,238,0.15)", border:"1px solid rgba(123,104,238,0.25)",
        display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24 }}>
        <BrainCircuit size={22} color="#9B8FF5" />
      </div>
      <div style={{ fontSize:40, fontWeight:900, color:"var(--text-1)", textAlign:"center",
        letterSpacing:"-0.01em", lineHeight:1.1, marginBottom:10 }}>
        {word.word}
      </div>
      <div style={{ fontSize:16, color:"var(--text-3)", fontFamily:"monospace" }}>
        {word.phonetics}
      </div>
      <div style={{ position:"absolute", bottom:20, display:"flex", alignItems:"center", gap:6,
        color:"var(--text-4)", fontSize:12 }}>
        Chạm để xem nghĩa <ChevronRight size={13} />
      </div>
    </div>
  );
}

function CardBack({ word }: { word:Word }) {
  const [imgSrc, setImgSrc]     = useState<string>("");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
    if (word.imageUrl) {
      setImgSrc(word.imageUrl);
    } else {
      // auto-fetch từ Unsplash Source (free, no key)
      setImgSrc(`https://source.unsplash.com/featured/480x300/?${encodeURIComponent(word.word)},object,illustration`);
    }
  }, [word.id, word.imageUrl, word.word]);

  const showImage = imgSrc && !imgFailed;

  return (
    <div style={{
      width:"100%", height:"100%",
      background: showImage ? "transparent" : "linear-gradient(160deg, #1B1535 0%, #140F2E 100%)",
      border:"1px solid rgba(155,143,245,0.25)",
      borderRadius:"var(--r-xl)",
      display:"flex", flexDirection:"column",
      cursor:"pointer", position:"relative", overflow:"hidden",
    }}>
      {/* ── Image section ── */}
      {showImage && (
        <div style={{ position:"relative", flex:"0 0 48%", overflow:"hidden" }}>
          <img
            src={imgSrc}
            alt={word.word}
            onError={() => setImgFailed(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          />
          {/* gradient fade to card body */}
          <div style={{
            position:"absolute", bottom:0, left:0, right:0, height:"50%",
            background:"linear-gradient(to bottom, transparent, #140F2E)",
          }} />
        </div>
      )}

      {/* ── Text section ── */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        padding: showImage ? "16px 24px 24px" : "40px 32px",
        background: showImage ? "#140F2E" : "transparent",
        position:"relative",
      }}>
        {/* ambient glow (only when no image) */}
        {!showImage && (
          <div style={{ position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
            width:"70%", height:"60%",
            background:"radial-gradient(ellipse, rgba(232,121,160,0.08) 0%, transparent 70%)" }} />
        )}

        {/* Topic badge */}
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase",
          padding:"3px 12px", borderRadius:99, marginBottom:12,
          background:"rgba(123,104,238,0.18)", border:"1px solid rgba(123,104,238,0.28)",
          color:"#9B8FF5", zIndex:1 }}>
          {word.topic}
        </div>

        {/* Meaning */}
        <div style={{
          fontSize: showImage ? 26 : 32,
          fontWeight:800, textAlign:"center", marginBottom:10, lineHeight:1.25,
          background:"linear-gradient(135deg,#9B8FF5 0%,#E879A0 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          zIndex:1,
        }}>
          {word.meaning}
        </div>

        {/* Example */}
        {word.example && (
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)", textAlign:"center",
            fontStyle:"italic", lineHeight:1.55, maxWidth:300, zIndex:1 }}>
            &ldquo;{word.example}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}


/* ── Swipeable Card ── */
function SwipeCard({ word, flipped, onFlip, onRate }:{
  word:Word; flipped:boolean; onFlip:()=>void; onRate:(r:FlashcardRating)=>void
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220,220], [-14,14]);
  const leftO  = useTransform(x, [-130,-40], [1,0]);
  const rightO = useTransform(x, [40,130], [0,1]);
  const dragging = useRef(false);

  const onDragEnd = (_:unknown, info:{offset:{x:number}}) => {
    if (info.offset.x < -90) onRate("forgot");
    else if (info.offset.x > 90) onRate("easy");
    dragging.current = false;
  };

  const speak = (e:React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(word.word);
      u.lang="en-US"; u.rate=0.85;
      speechSynthesis.speak(u);
    }
  };

  return (
    <div style={{ position:"relative", width:"100%" }}>
      {/* Swipe hints */}
      <motion.div style={{ opacity:leftO, position:"absolute", left:8, top:"40%",
        transform:"translateY(-50%)", zIndex:10, pointerEvents:"none" }}>
        <div style={{ background:"var(--rose-dim)", border:"2px solid rgba(251,113,133,0.5)",
          borderRadius:12, padding:"8px 14px", fontWeight:800, fontSize:13, color:"#FB7185" }}>
          ✕ Quên
        </div>
      </motion.div>
      <motion.div style={{ opacity:rightO, position:"absolute", right:8, top:"40%",
        transform:"translateY(-50%)", zIndex:10, pointerEvents:"none" }}>
        <div style={{ background:"var(--teal-dim)", border:"2px solid rgba(45,212,191,0.5)",
          borderRadius:12, padding:"8px 14px", fontWeight:800, fontSize:13, color:"#2DD4BF" }}>
          Thuộc ✓
        </div>
      </motion.div>

      <motion.div drag="x" dragConstraints={{left:-10,right:10}} dragElastic={0.38}
        onDragStart={()=>{dragging.current=true;}}
        onDragEnd={onDragEnd}
        style={{ x, rotate, touchAction:"none" }}>

        <div className="flip-scene" style={{ height:380 }}>
          <div className={`flip-inner ${flipped?"flipped":""}`}>
            <div className="flip-face">
              <div onClick={()=>{ if(!dragging.current) onFlip(); }} style={{ width:"100%", height:"100%" }}>
                <CardFront word={word} />
              </div>
            </div>
            <div className="flip-face flip-back">
              <div onClick={()=>{ if(!dragging.current) onFlip(); }} style={{ width:"100%", height:"100%" }}>
                <CardBack word={word} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Speak */}
      <div style={{ display:"flex", justifyContent:"center", marginTop:12 }}>
        <button onClick={speak} className="btn btn-secondary"
          style={{ padding:"7px 16px", fontSize:12, borderRadius:"var(--r-sm)" }}>
          <Volume2 size={13}/> Phát âm
        </button>
      </div>
    </div>
  );
}

/* ── Rating Buttons ── */
function Ratings({ onRate }:{ onRate:(r:FlashcardRating)=>void }) {
  const opts = [
    { r:"forgot" as FlashcardRating,     icon:XCircle,      label:"Quên",      sub:"Ôn lại sau 1 ngày",  c:"#FB7185", bg:"var(--rose-dim)",  bd:"rgba(251,113,133,0.3)", k:"1" },
    { r:"remembered" as FlashcardRating, icon:Zap,          label:"Tạm nhớ",   sub:"Ôn lại sau 3 ngày",  c:"#F59E0B", bg:"var(--amber-dim)", bd:"rgba(245,158,11,0.3)",  k:"2" },
    { r:"easy" as FlashcardRating,       icon:CheckCircle2, label:"Rất thuộc", sub:"Ôn lại sau 7 ngày",  c:"#2DD4BF", bg:"var(--teal-dim)",  bd:"rgba(45,212,191,0.3)",  k:"3" },
  ];
  return (
    <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}>
      <div style={{ fontSize:12, fontWeight:600, textAlign:"center", color:"var(--text-4)",
        marginBottom:12, textTransform:"uppercase", letterSpacing:"0.08em" }}>
        Bạn nhớ được đến mức nào?
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
        {opts.map(({ r, icon:Icon, label, sub, c, bg, bd, k })=>(
          <button key={r} onClick={()=>onRate(r)}
            style={{ padding:"16px 8px", borderRadius:"var(--r-md)",
              border:`1.5px solid ${bd}`, background:bg,
              cursor:"pointer", display:"flex", flexDirection:"column",
              alignItems:"center", gap:8, transition:"all 0.15s" }}
            onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.03)")}
            onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}>
            <Icon size={22} color={c} />
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:c }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-4)", marginTop:2 }}>{sub}</div>
            </div>
            <div style={{ fontSize:10, padding:"2px 8px", borderRadius:99,
              background:"rgba(255,255,255,0.06)", color:"var(--text-4)",
              display:"none" }} className="key-hint">
              Phím {k}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Session Done ── */
function Done({ stats, onRestart }:{ stats:{total:number;correct:number;forgot:number}; onRestart:()=>void }) {
  const pct = stats.total>0 ? Math.round((stats.correct/stats.total)*100) : 0;
  return (
    <motion.div initial={{opacity:0,scale:0.92}} animate={{opacity:1,scale:1}}
      style={{ display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", flex:1, gap:24, textAlign:"center", padding:"16px 0" }}>
      <div style={{ width:80, height:80, borderRadius:"50%",
        background:"linear-gradient(135deg,#7B68EE,#E879A0)",
        boxShadow:"0 12px 40px rgba(123,104,238,0.5)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Trophy size={36} color="white" />
      </div>
      <div>
        <div style={{ fontSize:24, fontWeight:800, color:"var(--text-1)", marginBottom:6 }}>
          {pct >= 70 ? "Xuất sắc! 🎉" : "Phiên học xong! 💪"}
        </div>
        <div style={{ fontSize:14, color:"var(--text-3)" }}>
          {pct >= 70 ? "Bạn đang tiến bộ rất tốt!" : "Tiếp tục luyện tập thêm nhé!"}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:"100%", maxWidth:300 }}>
        {[
          { label:"Tổng từ",    val:stats.total,   c:"var(--text-1)" },
          { label:"Đúng",       val:stats.correct, c:"#2DD4BF" },
          { label:"Chính xác",  val:`${pct}%`,     c: pct>=70?"#2DD4BF":pct>=40?"#F59E0B":"#FB7185" },
        ].map(s=>(
          <div key={s.label} style={{ background:"var(--bg-raised)", border:"1px solid var(--border)",
            borderRadius:"var(--r-md)", padding:"14px 8px", textAlign:"center" }}>
            <div style={{ fontSize:24, fontWeight:800, color:s.c }}>{s.val}</div>
            <div style={{ fontSize:11, color:"var(--text-4)", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, width:"100%", maxWidth:300 }}>
        <Link href="/" style={{ flex:1, display:"block" }}>
          <button className="btn btn-secondary" style={{ width:"100%", padding:"12px" }}>Trang chủ</button>
        </Link>
        <button onClick={onRestart} className="btn btn-primary" style={{ flex:1, padding:"12px" }}>
          <RotateCcw size={14} /> Ôn tiếp
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main ── */
export default function FlashcardPage() {
  const [queue,  setQueue]  = useState<Word[]>([]);
  const [idx,    setIdx]    = useState(0);
  const [flipped,setFlipped]= useState(false);
  const [done,   setDone]   = useState(false);
  const [stats,  setStats]  = useState({total:0,correct:0,forgot:0});
  const [loading,setLoading]= useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const due = await getDueWords();
    setQueue(due); setIdx(0); setFlipped(false);
    setDone(false); setStats({total:0,correct:0,forgot:0}); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e:KeyboardEvent) => {
      if (done || !queue[idx]) return;
      if (e.code==="Space") { e.preventDefault(); setFlipped(f=>!f); }
      if (flipped) {
        if (e.key==="1") rate("forgot");
        if (e.key==="2") rate("remembered");
        if (e.key==="3") rate("easy");
      }
    };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done,idx,queue,flipped]);

  const rate = async (r:FlashcardRating) => {
    const w = queue[idx]; if(!w) return;
    await updateWord(w.id, applyRating(w, r));
    const ok = r!=="forgot";
    const ns = { total:stats.total+1, correct:stats.correct+(ok?1:0), forgot:stats.forgot+(!ok?1:0) };
    setStats(ns);
    if (idx+1>=queue.length) { await recordSession(ns.total,ns.correct); setDone(true); }
    else { setIdx(i=>i+1); setFlipped(false); }
  };

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100dvh" }}>
      <div style={{ width:32, height:32, border:"3px solid rgba(123,104,238,0.3)",
        borderTopColor:"#7B68EE", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const cur = queue[idx];

  return (
    <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 20px",
      display:"flex", flexDirection:"column", minHeight:"100dvh" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <Link href="/" style={{ textDecoration:"none" }}>
          <button className="btn btn-secondary" style={{ padding:10, borderRadius:"var(--r-sm)" }}>
            <ArrowLeft size={17} color="var(--text-2)" />
          </button>
        </Link>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:16, color:"var(--text-1)",
            display:"flex", alignItems:"center", gap:8 }}>
            <BrainCircuit size={17} color="#7B68EE" /> Phòng ôn tập
          </div>
          {!done && queue.length>0 && (
            <div style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>
              {idx+1} / {queue.length} từ
            </div>
          )}
        </div>
        {!done && queue.length>0 && (
          <div style={{ fontSize:13, fontWeight:700, padding:"5px 12px", borderRadius:99,
            background:"var(--teal-dim)", color:"#2DD4BF", border:"1px solid rgba(45,212,191,0.25)" }}>
            ✓ {stats.correct}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {!done && queue.length>0 && (
        <div style={{ marginBottom:24 }}>
          <Progress cur={idx} tot={queue.length} />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {done ? (
          <Done key="done" stats={stats} onRestart={load} />
        ) : queue.length===0 ? (
          <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}}
            style={{ flex:1, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", gap:16, textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%",
              background:"var(--teal-dim)", border:"2px solid rgba(45,212,191,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 size={32} color="#2DD4BF" />
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:"var(--text-1)", marginBottom:6 }}>
                Tất cả đã ôn xong! 🎉
              </div>
              <div style={{ fontSize:14, color:"var(--text-3)" }}>Không có từ nào cần ôn hôm nay</div>
            </div>
            <Link href="/vocabulary">
              <button className="btn btn-primary" style={{ padding:"12px 24px" }}>Thêm từ mới</button>
            </Link>
          </motion.div>
        ) : (
          <motion.div key={cur?.id}
            initial={{opacity:0, x:32}} animate={{opacity:1, x:0}}
            exit={{opacity:0, x:-32}} transition={{duration:0.22, ease:"easeOut"}}
            style={{ flex:1, display:"flex", flexDirection:"column", gap:20 }}>

            <SwipeCard word={cur} flipped={flipped}
              onFlip={()=>setFlipped(f=>!f)} onRate={rate} />

            <AnimatePresence>
              {flipped && <Ratings key="r" onRate={rate} />}
            </AnimatePresence>

            {!flipped && (
              <div style={{ textAlign:"center", fontSize:11, color:"var(--text-4)" }}
                className="desktop-hint">
                Space = lật thẻ · Vuốt trái/phải trên mobile
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        /* Hide keyboard hints on touch devices */
        .key-hint { display:none; }
        .desktop-hint { display:none; }
        @media (hover:hover) and (pointer:fine) {
          .key-hint { display:block !important; }
          .desktop-hint { display:block !important; }
        }
        /* No tap highlight on all interactive elements */
        button, a { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
