"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pageVariants, containerVariants, cardVariants, slideUpVariants, popVariants, fadeVariants } from "@/lib/animations";
import { Mic, Send, Bot, User, RotateCcw, MessageSquare, Briefcase, Map, Plane, CheckCircle2 } from "lucide-react";
import { getGamificationState, saveGamificationState } from "@/lib/gamification";

type ScenarioId = "food" | "interview" | "directions" | "airport";

interface Scenario {
  id: ScenarioId;
  title: string;
  icon: any;
  difficulty: string;
  turns: { ai: string; suggestions: string[] }[];
}

const scenarios: Scenario[] = [
  {
    id: "food",
    title: "Đặt Đồ Ăn",
    icon: <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>🍕</span>,
    difficulty: "Dễ",
    turns: [
      { ai: "Hello! Welcome to Pho Garden. What would you like to order?", suggestions: ["I'd like to order...", "What do you recommend?", "Do you have vegetarian options?"] },
      { ai: "Great choice! Would you like that with noodles or rice?", suggestions: ["Noodles, please.", "I prefer rice.", "Can I have both?"] },
      { ai: "Any drinks with that?", suggestions: ["Just water, thanks.", "I'll have an iced tea.", "A soda please."] },
      { ai: "Perfect! That will be 85,000 VND. Will you pay by cash or card?", suggestions: ["By card, please.", "Here is the cash.", "Do you take mobile payments?"] },
    ]
  },
  {
    id: "interview",
    title: "Phỏng Vấn",
    icon: <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>💼</span>,
    difficulty: "Khó",
    turns: [
      { ai: "Good morning! Please tell me about yourself and your background.", suggestions: ["I have experience in...", "My strongest skill is...", "I graduated from..."] },
      { ai: "Interesting! Why are you interested in this position?", suggestions: ["I love the company culture.", "It aligns with my goals.", "I want to grow my career here."] },
      { ai: "What is your greatest strength?", suggestions: ["I am a fast learner.", "I work well in a team.", "My problem-solving skills."] },
      { ai: "Where do you see yourself in 5 years?", suggestions: ["Leading a team.", "Being an expert in my field.", "Contributing to big projects."] },
    ]
  },
  {
    id: "directions",
    title: "Hỏi Đường",
    icon: <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>🗺️</span>,
    difficulty: "Trung bình",
    turns: [
      { ai: "Excuse me! Can you help me find the nearest post office?", suggestions: ["Sure! Go straight...", "Turn left at...", "It's about 5 minutes away"] },
      { ai: "Thank you! Is it far from here?", suggestions: ["Not at all, it's very close.", "Yes, maybe 2 kilometers.", "It's a bit of a walk."] },
      { ai: "Should I take the bus or walk?", suggestions: ["Walking is fine.", "Take bus number 5.", "A taxi is faster."] },
      { ai: "You're very helpful! I really appreciate it.", suggestions: ["You're welcome!", "No problem at all.", "Have a great day!"] },
    ]
  },
  {
    id: "airport",
    title: "Sân Bay",
    icon: <span style={{ fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>✈️</span>,
    difficulty: "Trung bình",
    turns: [
      { ai: "Good afternoon! May I see your passport and boarding pass please?", suggestions: ["Here you are.", "I have an e-ticket.", "Sure, just a moment."] },
      { ai: "Do you have any luggage to check in?", suggestions: ["I have one bag to check.", "Just a carry-on.", "Two suitcases."] },
      { ai: "Your seat is 24A, window seat. Do you have any special meal requests?", suggestions: ["No, thank you.", "Vegetarian meal, please.", "I need a gluten-free option."] },
      { ai: "Boarding starts at Gate 12 in 45 minutes. Enjoy your flight!", suggestions: ["Thank you very much.", "Where is Gate 12?", "Have a good day!"] },
    ]
  }
];

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
}

export default function AIChatPage() {
  const [activeScenario, setActiveScenario] = useState<Scenario>(scenarios[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [wordsUsed, setWordsUsed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startScenario(scenarios[0]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showSummary]);

  const startScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setMessages([]);
    setCurrentTurn(0);
    setShowSummary(false);
    setWordsUsed(0);
    
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{
        id: Date.now().toString(),
        sender: "ai",
        text: scenario.turns[0].ai,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping || showSummary) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    
    // Simulate finding a known word
    if (text.toLowerCase().includes("the") || text.toLowerCase().includes("a") || text.length > 15) {
        setWordsUsed(prev => prev + 1);
        if (Math.random() > 0.5) {
            setToast("Từ mới đã dùng: " + text.split(" ")[0]);
            setTimeout(() => setToast(null), 3000);
        }
    }

    const nextTurn = currentTurn + 1;
    if (nextTurn < activeScenario.turns.length) {
      setCurrentTurn(nextTurn);
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: "ai",
          text: activeScenario.turns[nextTurn].ai,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
      }, 1500);
    } else {
      setTimeout(() => {
        setShowSummary(true);
        grantReward();
      }, 1000);
    }
  };

  const grantReward = async () => {
    try {
        const state = await getGamificationState();
        state.xp += 50;
        await saveGamificationState(state);
    } catch (e) {
        console.error(e);
    }
  };

  const renderWordWithTooltip = (word: string, i: number) => (
    <span key={i} className="group relative inline-block cursor-pointer hover:bg-[var(--bg-base)] px-1 rounded transition-colors">
      {word}
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-[var(--text-1)] text-[var(--bg-base)] text-xs px-2 py-1 rounded whitespace-nowrap z-10 font-bold border-2 border-[var(--border-color)]">
        Dịch ({word.replace(/[.,!?]/g, "")})
      </span>
    </span>
  );

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" exit="exit" className="flex h-[calc(100vh-80px)] max-h-[900px] bg-[var(--bg-base)] text-[var(--text-1)] font-sans p-4 gap-4 overflow-hidden flex-col md:flex-row">
      {/* Toast */}
      <AnimatePresence>
          {toast && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#38E54D] text-[#111118] px-4 py-2 font-bold border-2 border-[#111118] z-50 rounded"
                style={{ boxShadow: "4px 4px 0px #111118" }}
              >
                  {toast}
              </motion.div>
          )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full md:w-[240px] flex-shrink-0 flex flex-col gap-3"
      >
        <h2 className="text-xl font-black uppercase mb-2 text-[var(--text-1)]">Chủ đề Giao Tiếp</h2>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 hide-scrollbar flex-1">
            {scenarios.map(s => (
            <motion.button
                variants={cardVariants}
                key={s.id}
                onClick={() => startScenario(s)}
                className="flex-shrink-0 text-left p-3 rounded-lg font-bold transition-transform active:translate-x-[3px] active:translate-y-[3px]"
                whileHover={{ y: -2, boxShadow: "var(--neo-shadow-lg)" }}
                style={{
                backgroundColor: activeScenario.id === s.id ? "#FFE052" : "var(--card-bg)",
                border: "2.5px solid var(--border-color)",
                boxShadow: activeScenario.id === s.id ? "none" : "var(--neo-shadow)",
                transform: activeScenario.id === s.id ? "translate(3px, 3px)" : "none",
                color: activeScenario.id === s.id ? "#111118" : "var(--text-1)"
                }}
            >
                <div className="flex items-center gap-3 text-lg">
                    {s.icon} <span className="whitespace-nowrap">{s.title}</span>
                </div>
            </motion.button>
            ))}
        </motion.div>
      </motion.div>

      {/* Chat Area */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 flex flex-col rounded-2xl overflow-hidden relative"
        style={{
          backgroundColor: "var(--bg-base)",
          border: "3px solid var(--border-color)",
          boxShadow: "var(--neo-shadow)"
        }}
      >
        {/* Chat Header */}
        <div className="p-4 border-b-[3px] flex justify-between items-center bg-[var(--card-bg)]" style={{ borderColor: "var(--border-color)" }}>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              {activeScenario.icon} {activeScenario.title}
            </h2>
            <span className="text-sm font-bold opacity-70">Độ khó: {activeScenario.difficulty}</span>
          </div>
          <button 
            onClick={() => startScenario(activeScenario)}
            className="p-2.5 rounded-xl bg-[#FF5964] text-[#111118] hover:opacity-90 active:translate-y-1 active:translate-x-1 transition-transform"
            style={{ border: "2.5px solid var(--border-color)", boxShadow: "2px 2px 0px var(--border-color)" }}
            title="Bắt đầu lại"
          >
            <RotateCcw size={22} strokeWidth={3} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 bg-[var(--bg-base)]">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div 
                key={msg.id}
                variants={slideUpVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} gap-3 w-full`}
              >
              {msg.sender === "ai" && (
                <div className="w-10 h-10 rounded-full bg-[#4ECCD3] flex items-center justify-center flex-shrink-0" style={{ border: "2.5px solid var(--border-color)" }}>
                  <Bot size={20} color="#111118" />
                </div>
              )}
              <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
                <div 
                  className={`p-3.5 rounded-2xl font-semibold text-lg leading-relaxed shadow-sm ${msg.sender === "user" ? "rounded-tr-none bg-[#9C8EFA] text-[#111118]" : "rounded-tl-none bg-[var(--card-bg)] text-[var(--text-1)]"}`}
                  style={{ border: "2.5px solid var(--border-color)" }}
                >
                  {msg.sender === "ai" 
                    ? msg.text.split(" ").map((w, i) => renderWordWithTooltip(w + " ", i))
                    : msg.text}
                </div>
                <span className={`text-xs font-bold opacity-50 mt-1.5 px-1 text-[var(--text-2)] ${msg.sender === "user" ? "text-right" : "text-left"}`}>{msg.timestamp}</span>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          
          <AnimatePresence>
          {isTyping && (
            <motion.div variants={slideUpVariants} initial="hidden" animate="visible" exit="exit" className="flex justify-start gap-3">
               <div className="w-10 h-10 rounded-full bg-[#4ECCD3] flex items-center justify-center flex-shrink-0" style={{ border: "2.5px solid var(--border-color)" }}>
                  <Bot size={20} color="#111118" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-[var(--card-bg)] flex items-center gap-1.5 h-12" style={{ border: "2.5px solid var(--border-color)" }}>
                    <span className="w-2.5 h-2.5 bg-[var(--text-2)] rounded-full animate-bounce" />
                    <span className="w-2.5 h-2.5 bg-[var(--text-2)] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2.5 h-2.5 bg-[var(--text-2)] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
            </motion.div>
          )}

          {showSummary && (
             <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="mx-auto w-full max-w-md bg-[#FF8E53] text-[#111118] p-6 rounded-2xl mt-4 text-center"
             style={{ border: "3px solid #111118", boxShadow: "8px 8px 0px #111118" }}
           >
             <CheckCircle2 size={56} className="mx-auto mb-3" />
             <h3 className="text-2xl font-black uppercase mb-5">Hoàn thành xuất sắc!</h3>
             <div className="flex justify-around mb-5 bg-white/20 p-4 rounded-xl" style={{ border: "2px solid #111118" }}>
                <div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Lượt thoại</p>
                    <p className="text-3xl font-black">{activeScenario.turns.length * 2}</p>
                </div>
                <div>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Từ vựng mới</p>
                    <p className="text-3xl font-black">{wordsUsed + 2}</p>
                </div>
             </div>
             <div className="font-black text-xl mb-6 bg-[#FFE052] p-3 rounded-lg border-2 border-[#111118] inline-block">Thưởng: +50 XP</div>
             <button 
                onClick={() => startScenario(activeScenario)}
                className="w-full py-3.5 bg-white text-[#111118] font-black uppercase text-lg rounded-xl active:translate-y-1 transition-transform"
                style={{ border: "3px solid #111118", boxShadow: "4px 4px 0px #111118" }}
             >
                 Luyện tập lại
             </button>
           </motion.div>
          )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t-[3px] bg-[var(--bg-base)] flex flex-col gap-3" style={{ borderColor: "var(--border-color)" }}>
            {/* Suggestions */}
            {!isTyping && !showSummary && currentTurn < activeScenario.turns.length && (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2 pt-1">
                    <span className="text-[var(--text-3)] text-sm font-bold py-1.5 flex-shrink-0">Gợi ý:</span>
                    {activeScenario.turns[currentTurn].suggestions.map((sug, i) => (
                        <motion.button
                            variants={cardVariants}
                            whileHover={{ y: -2, boxShadow: "var(--neo-shadow-lg)" }}
                            key={i}
                            onClick={() => setInput(sug)}
                            className="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold bg-[var(--card-bg)] text-[var(--text-1)] active:scale-95 transition-transform"
                            style={{ border: "2.5px solid var(--border-color)", boxShadow: "2px 2px 0px var(--border-color)" }}
                        >
                            {sug}
                        </motion.button>
                    ))}
                </motion.div>
            )}

            <div className="flex gap-3 items-end">
                <button className="p-3.5 bg-[#FFE052] rounded-xl flex-shrink-0 active:translate-y-1 active:translate-x-1 transition-transform text-[#111118]" style={{ border: "2.5px solid var(--border-color)", boxShadow: "4px 4px 0px var(--border-color)" }}>
                    <Mic size={24} strokeWidth={2.5} />
                </button>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
                    placeholder="Nhập câu trả lời..."
                    className="flex-1 p-3.5 rounded-xl resize-none font-semibold text-lg h-[60px] bg-[var(--card-bg)] text-[var(--text-1)] focus:outline-none placeholder-[var(--text-3)]"
                    style={{ border: "2.5px solid var(--border-color)", boxShadow: "inset 2px 2px 0px rgba(0,0,0,0.05)" }}
                />
                <button 
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isTyping || showSummary}
                    className="p-3.5 bg-[#38E54D] text-[#111118] rounded-xl flex-shrink-0 active:translate-y-1 active:translate-x-1 transition-transform disabled:opacity-50 disabled:active:translate-y-0 disabled:active:translate-x-0" 
                    style={{ border: "2.5px solid var(--border-color)", boxShadow: "4px 4px 0px var(--border-color)" }}
                >
                    <Send size={24} strokeWidth={2.5} />
                </button>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
