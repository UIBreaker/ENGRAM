"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Lock, Check, Sparkles, Palette, User, Shield } from "lucide-react";
import { getGamificationState, saveGamificationState } from "@/lib/gamification";

type Category = "theme" | "avatar" | "item";

interface ShopItem {
  id: string;
  category: Category;
  name: string;
  description: string;
  icon: any;
  price: number;
  reqLevel?: number;
  reqStreak?: number;
  color: string;
  isStackable?: boolean;
}

const shopItems: ShopItem[] = [
  // THEMES
  { id: "th_sun", category: "theme", name: "Cam Nắng", description: "Giao diện cam ấm áp", icon: "☀️", price: 500, color: "#FF8E53" },
  { id: "th_ocean", category: "theme", name: "Đại Dương", description: "Giao diện xanh biển sâu", icon: "🌊", price: 800, color: "#4ECCD3" },
  { id: "th_sakura", category: "theme", name: "Hoa Anh Đào", description: "Giao diện hồng phấn", icon: "🌸", price: 1200, reqLevel: 3, color: "#FF70A6" },
  { id: "th_night", category: "theme", name: "Đêm Huyền Bí", description: "Giao diện tím mộng mơ", icon: "🌙", price: 2000, reqLevel: 5, color: "#9C8EFA" },
  { id: "th_diamond", category: "theme", name: "Kim Cương", description: "Giao diện lấp lánh", icon: "💎", price: 5000, reqLevel: 8, color: "#E0F2FE" },
  // AVATARS
  { id: "av_fire", category: "avatar", name: "Lửa Học Tập", description: "Khung avatar bốc lửa", icon: "🔥", price: 300, reqStreak: 7, color: "#FF5964" },
  { id: "av_lightning", category: "avatar", name: "Tốc Độ", description: "Khung avatar tia chớp", icon: "⚡", price: 600, color: "#FFE052" },
  { id: "av_star", category: "avatar", name: "Siêu Sao", description: "Khung avatar ngôi sao", icon: "🌟", price: 1500, reqLevel: 6, color: "#FFE052" },
  { id: "av_crown", category: "avatar", name: "Huyền Thoại", description: "Khung avatar vương miện", icon: "👑", price: 3000, reqStreak: 30, color: "#FF8E53" },
  // ITEMS
  { id: "it_freeze", category: "item", name: "Bùa Đóng Băng", description: "Bảo vệ chuỗi ngày học 1 ngày", icon: "🛡️", price: 200, color: "#4ECCD3", isStackable: true },
  { id: "it_double_xp", category: "item", name: "Tăng Tốc XP x2", description: "Nhân đôi XP nhận được trong 1 giờ", icon: "⚡", price: 400, color: "#FFE052", isStackable: true },
  { id: "it_hint", category: "item", name: "Gợi Ý Từ", description: "Gợi ý đáp án cho 5 flashcard", icon: "💡", price: 100, color: "#38E54D", isStackable: true },
  { id: "it_skip", category: "item", name: "Skip Câu Khó", description: "Bỏ qua 3 câu hỏi khó", icon: "🎯", price: 150, color: "#FF5964", isStackable: true },
];

export default function ShopPage() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [activeTab, setActiveTab] = useState<Category>("theme");
  const [ownedItems, setOwnedItems] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const state = await getGamificationState();
      setXp(state.xp);
      setStreak(state.streak);
      // Rough level calculation based on XP if not provided directly
      setLevel(Math.floor(state.xp / 1000) + 1);

      const saved = localStorage.getItem("engram_shop_v1");
      if (saved) {
        setOwnedItems(JSON.parse(saved));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePurchase = async (item: ShopItem) => {
    if (xp < item.price) {
      showToast("Không đủ XP!", "error");
      return;
    }

    try {
      // Deduct XP
      const state = await getGamificationState();
      state.xp -= item.price;
      await saveGamificationState(state);
      setXp(state.xp);

      // Save ownership
      const newOwned = { ...ownedItems };
      if (item.isStackable) {
        newOwned[item.id] = (newOwned[item.id] || 0) + 1;
      } else {
        newOwned[item.id] = 1;
      }
      setOwnedItems(newOwned);
      localStorage.setItem("engram_shop_v1", JSON.stringify(newOwned));

      showToast(`Đã mua thành công ${item.name}!`, "success");
    } catch (e) {
      showToast("Có lỗi xảy ra, thử lại sau.", "error");
    }
  };

  const getStatus = (item: ShopItem) => {
    if (!item.isStackable && ownedItems[item.id]) {
      return { type: "owned", text: "Đã sở hữu", color: "#38E54D" };
    }
    if (item.reqLevel && level < item.reqLevel) {
      return { type: "locked", text: `Yêu cầu Lv.${item.reqLevel}`, color: "#9CA3AF" };
    }
    if (item.reqStreak && streak < item.reqStreak) {
      return { type: "locked", text: `Cần Streak ${item.reqStreak} ngày`, color: "#9CA3AF" };
    }
    return { type: "buy", text: "Mua ngay", color: "#FFE052" };
  };

  const renderEmoji = (emoji: string) => (
    <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>{emoji}</span>
  );

  if (loading) {
      return <div className="p-12 text-center text-2xl font-black text-[var(--text-1)]">Đang tải cửa hàng...</div>
  }

  const filteredItems = shopItems.filter(i => i.category === activeTab);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen pb-20">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 text-lg font-black border-[3px] border-[#111118] z-50 rounded-xl text-[#111118]`}
            style={{ 
              backgroundColor: toast.type === "success" ? "#38E54D" : "#FF5964",
              boxShadow: "6px 6px 0px #111118" 
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-center bg-[var(--card-bg)] p-6 md:p-8 rounded-2xl mb-8 border-[3px] border-[var(--border-color)]"
        style={{ boxShadow: "var(--neo-shadow)" }}
      >
        <div className="text-center md:text-left mb-6 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--text-1)] mb-2 tracking-wide" style={{ textShadow: "2px 2px 0px var(--bg-base)" }}>Cửa Hàng</h1>
          <p className="text-[var(--text-2)] font-bold text-lg md:text-xl">Đổi XP để nhận vật phẩm độc quyền</p>
        </div>
        <div className="flex items-center gap-4 bg-[#FFE052] px-6 py-4 rounded-2xl border-[3px] border-[#111118]" style={{ boxShadow: "6px 6px 0px #111118" }}>
          <Coins size={40} color="#111118" className="animate-bounce" />
          <div>
            <div className="text-sm font-black uppercase text-[#111118] opacity-80 tracking-wider">Số dư của bạn</div>
            <div className="text-4xl font-black text-[#111118]">{xp} XP</div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar pb-3 pt-1 px-1">
        {[
          { id: "theme", label: "Giao Diện", icon: Palette, color: "#FF70A6" },
          { id: "avatar", label: "Khung Avatar", icon: User, color: "#4ECCD3" },
          { id: "item", label: "Vật Phẩm", icon: Shield, color: "#9C8EFA" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Category)}
            className="flex items-center gap-2.5 px-6 py-4 rounded-xl font-black text-lg transition-transform whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? tab.color : "var(--card-bg)",
              color: activeTab === tab.id ? "#111118" : "var(--text-1)",
              border: "3px solid var(--border-color)",
              boxShadow: activeTab === tab.id ? "4px 4px 0px var(--border-color)" : "var(--neo-shadow)",
              transform: activeTab === tab.id ? "translate(-2px, -2px)" : "translate(0,0)"
            }}
          >
            <tab.icon size={24} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Item Grid */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {filteredItems.map(item => {
          const status = getStatus(item);
          return (
            <div 
              key={item.id}
              className="bg-[var(--card-bg)] rounded-2xl p-6 flex flex-col border-[3px] border-[var(--border-color)] transition-transform hover:-translate-y-1"
              style={{ boxShadow: "var(--neo-shadow)" }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-[3px] border-[var(--border-color)] flex-shrink-0"
                  style={{ backgroundColor: item.color, boxShadow: "4px 4px 0px var(--border-color)" }}
                >
                  {renderEmoji(item.icon)}
                </div>
                <div className="pt-1">
                  <h3 className="text-xl font-black text-[var(--text-1)] mb-1 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-[#FF8E53] font-black text-lg bg-[#FF8E53]/10 px-2 py-0.5 rounded-lg inline-flex" style={{ border: "2px solid #FF8E53" }}>
                    <Sparkles size={18} />
                    {item.price} XP
                  </div>
                </div>
              </div>
              <p className="text-[var(--text-2)] font-bold text-lg mb-6 flex-1 leading-snug">{item.description}</p>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t-2 border-[var(--border-color)]/20">
                {item.isStackable && ownedItems[item.id] > 0 ? (
                  <span className="font-black text-sm text-[var(--text-1)] bg-[var(--bg-base)] px-3 py-1.5 rounded-lg border-2 border-[var(--border-color)] uppercase tracking-wide">
                    Đã có: <span className="text-[#38E54D] text-base">{ownedItems[item.id]}</span>
                  </span>
                ) : <span />}

                <button
                  onClick={() => status.type === "buy" && handlePurchase(item)}
                  disabled={status.type !== "buy"}
                  className={`px-5 py-3 rounded-xl font-black text-base flex items-center gap-2 transition-transform disabled:active:translate-y-0 disabled:active:translate-x-0 ${status.type === "buy" ? "active:translate-y-1 active:translate-x-1" : ""}`}
                  style={{
                    backgroundColor: status.color,
                    color: status.type === "locked" ? "#ffffff" : "#111118",
                    border: "3px solid var(--border-color)",
                    boxShadow: status.type === "buy" ? "4px 4px 0px var(--border-color)" : "none",
                    opacity: status.type === "locked" ? 0.7 : 1
                  }}
                >
                  {status.type === "owned" && <Check size={20} strokeWidth={3} />}
                  {status.type === "locked" && <Lock size={20} strokeWidth={3} />}
                  {status.type === "buy" && <Coins size={20} strokeWidth={3} />}
                  {status.text}
                </button>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
