"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, MessageSquare, Newspaper, X, Clock, ChevronRight, Bookmark } from "lucide-react";
import { getWords } from "@/lib/db";
import { useTheme } from "@/lib/theme";

// Types
interface Story {
  id: string;
  title: string;
  category: "Tin Tức" | "Hội Thoại" | "Truyện Ngắn";
  difficulty: "A1" | "A2" | "B1" | "B2" | "C1";
  emoji: string;
  wordCount: number;
  readTimeMin: number;
  excerpt: string;
  content: string;
}

interface Word {
  id: string;
  word: string;
  meaning: string;
}

// Sample Data
const STORIES: Story[] = [
  {
    id: "s1",
    title: "Tech Giant Announces New AI Features",
    category: "Tin Tức",
    difficulty: "B2",
    emoji: "🚀",
    wordCount: 150,
    readTimeMin: 2,
    excerpt: "The major technology company unveiled a suite of new artificial intelligence tools designed to improve productivity...",
    content: "The major technology company unveiled a suite of new artificial intelligence tools designed to improve productivity across its ecosystem. Speaking at the annual developer conference, the CEO emphasized the importance of ethical AI deployment. These new features will seamlessly integrate into existing applications, allowing users to automate repetitive tasks. Industry analysts predict this move will spark a new wave of innovation, though some critics raised concerns about privacy implications."
  },
  {
    id: "s2",
    title: "Coffee Shop Chat",
    category: "Hội Thoại",
    difficulty: "A2",
    emoji: "☕",
    wordCount: 85,
    readTimeMin: 1,
    excerpt: "Two friends catch up over coffee on a rainy Saturday morning...",
    content: "Alex: Hey Sarah! It's been a while. How are you?\nSarah: Hi Alex! I'm doing well, thanks. Just been really busy with work lately.\nAlex: I understand. What kind of project are you working on?\nSarah: We are launching a new website for our client. It requires a lot of collaboration.\nAlex: Sounds interesting! Let's order some coffee. I recommend the caramel macchiato."
  },
  {
    id: "s3",
    title: "The Lost Key",
    category: "Truyện Ngắn",
    difficulty: "B1",
    emoji: "🗝️",
    wordCount: 210,
    readTimeMin: 3,
    excerpt: "In the dusty attic, Oliver found an old, rusty key that didn't seem to fit any door in the house...",
    content: "In the dusty attic, Oliver found an old, rusty key that didn't seem to fit any door in the house. He asked his grandfather about it, but the old man only smiled mysteriously. 'Some keys,' his grandfather said, 'do not open doors, but rather memories.' Intrigued, Oliver embarked on a quest to discover the origin of the key. He searched through old journals and family photo albums. Eventually, he realized the key belonged to a small wooden music box his grandmother used to own. When he finally found the box and turned the key, a beautiful, nostalgic melody filled the room, bringing tears of joy to his grandfather's eyes."
  },
  {
    id: "s4",
    title: "Global Climate Summit Concludes",
    category: "Tin Tức",
    difficulty: "C1",
    emoji: "🌍",
    wordCount: 180,
    readTimeMin: 2,
    excerpt: "World leaders reached a unprecedented consensus on reducing carbon emissions by 2030...",
    content: "World leaders reached an unprecedented consensus on reducing carbon emissions by 2030, following intensive negotiations at the Global Climate Summit. The comprehensive agreement mandates strict regulations on industrial pollution and offers substantial subsidies for renewable energy initiatives. However, environmental activists argue that the timeline remains too lenient to mitigate the impending ecological crisis effectively. Developing nations expressed apprehension regarding the financial burden of transitioning to green technologies, prompting promises of international aid."
  },
  {
    id: "s5",
    title: "Job Interview",
    category: "Hội Thoại",
    difficulty: "B1",
    emoji: "💼",
    wordCount: 120,
    readTimeMin: 1,
    excerpt: "A candidate answers questions during a formal job interview for a marketing position...",
    content: "Interviewer: Can you describe a challenging situation you faced at your previous job and how you overcame it?\nCandidate: Certainly. We had a tight deadline for a major marketing campaign, and our lead designer suddenly fell ill. I had to step up and coordinate with freelance designers to ensure the project stayed on track. It required excellent communication and time management skills, but we successfully launched the campaign on time.\nInterviewer: That demonstrates great perseverance and leadership. What are your salary expectations?"
  }
];

export default function StoriesPage() {
  const [activeTab, setActiveTab] = useState<"Tất Cả" | "Tin Tức" | "Hội Thoại" | "Truyện Ngắn">("Tất Cả");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const words = await getWords();
        setKnownWords(words);
      } catch (error) {
        console.error("Failed to load words", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStories = activeTab === "Tất Cả" ? STORIES : STORIES.filter(s => s.category === activeTab);

  const getDifficultyColor = (diff: string) => {
    switch(diff) {
      case 'A1': case 'A2': return '#38E54D';
      case 'B1': case 'B2': return '#FFE052';
      case 'C1': return '#FF5964';
      default: return 'var(--text-1)';
    }
  };

  const renderTextWithHighlights = (text: string) => {
    if (!knownWords.length) return <span>{text}</span>;

    // Simple matching
    const wordsInText = text.split(/(\s+|[,.\n?!])/g);
    
    return wordsInText.map((word, i) => {
      const cleanWord = word.trim().toLowerCase();
      const matchedWord = knownWords.find(kw => kw.word.toLowerCase() === cleanWord);
      
      if (matchedWord) {
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span 
              onClick={() => setActiveWordId(activeWordId === matchedWord.id ? null : matchedWord.id)}
              style={{
                backgroundColor: "#FFE052",
                color: "#111",
                padding: "2px 6px",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "bold",
                border: "1.5px solid #111"
              }}
            >
              {word}
            </span>
            <AnimatePresence>
              {activeWordId === matchedWord.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "var(--card-bg)",
                    border: "2px solid var(--border-color)",
                    boxShadow: "var(--neo-shadow)",
                    padding: "8px",
                    borderRadius: "8px",
                    zIndex: 10,
                    minWidth: "150px",
                    textAlign: "center",
                    marginBottom: "8px"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{matchedWord.word}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>{matchedWord.meaning}</div>
                  <button className="btn" style={{ padding: "4px 8px", fontSize: "0.8rem", marginTop: "8px", width: "100%" }}>
                    <Bookmark size={14} style={{ display: "inline", marginRight: "4px" }} /> Lưu từ
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </span>
        );
      }
      return <span key={i}>{word}</span>;
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <BookOpen size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", paddingBottom: "100px" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "900", marginBottom: "0.5rem" }}>Sổ tay Ngữ Cảnh</h1>
        <p style={{ color: "var(--text-2)", fontSize: "1.1rem" }}>Học từ qua ngữ cảnh thực tế</p>
      </header>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {["Tất Cả", "Tin Tức", "Hội Thoại", "Truyện Ngắn"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className="card"
            style={{
              padding: "0.5rem 1.5rem",
              cursor: "pointer",
              backgroundColor: activeTab === tab ? "#9C8EFA" : "var(--card-bg)",
              color: activeTab === tab ? "#fff" : "var(--text-1)",
              fontWeight: "bold",
              transition: "transform 0.1s"
            }}
          >
            {tab === "Tin Tức" && <Newspaper size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />}
            {tab === "Hội Thoại" && <MessageSquare size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />}
            {tab === "Truyện Ngắn" && <BookOpen size={16} style={{ display: "inline", marginRight: "8px", verticalAlign: "middle" }} />}
            {tab}
          </button>
        ))}
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "2rem" 
      }}>
        {filteredStories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card"
            style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", cursor: "pointer" }}
            onClick={() => setSelectedStory(story)}
            whileHover={{ y: -5 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: "2rem", fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>{story.emoji}</span>
              <span style={{ 
                backgroundColor: getDifficultyColor(story.difficulty),
                padding: "4px 8px",
                borderRadius: "8px",
                fontWeight: "bold",
                border: "2px solid #111",
                color: "#111",
                fontSize: "0.9rem"
              }}>
                {story.difficulty}
              </span>
            </div>
            
            <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", margin: 0 }}>{story.title}</h3>
            
            <div style={{ display: "flex", gap: "1rem", color: "var(--text-2)", fontSize: "0.9rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BookOpen size={14} /> {story.wordCount} words
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> {story.readTimeMin} min
              </span>
            </div>
            
            <p style={{ color: "var(--text-3)", fontSize: "0.95rem", flex: 1 }}>
              {story.excerpt}
            </p>

            <button className="btn btn-primary" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              Đọc ngay <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              zIndex: 100
            }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="card"
              style={{
                width: "100%",
                maxWidth: "700px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "2rem",
                position: "relative",
                backgroundColor: "var(--bg-base)"
              }}
            >
              <button 
                onClick={() => setSelectedStory(null)}
                style={{
                  position: "absolute",
                  top: "1rem", right: "1rem",
                  background: "var(--card-bg)",
                  border: "2.5px solid var(--border-color)",
                  borderRadius: "50%",
                  width: "40px", height: "40px",
                  display: "flex", justifyContent: "center", alignItems: "center",
                  cursor: "pointer",
                  boxShadow: "var(--neo-shadow)"
                }}
              >
                <X size={20} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <span style={{ fontSize: "3rem", fontFamily: "sans-serif, Apple Color Emoji, Segoe UI Emoji" }}>{selectedStory.emoji}</span>
                <div>
                  <h2 style={{ fontSize: "2rem", fontWeight: "900", margin: 0 }}>{selectedStory.title}</h2>
                  <div style={{ display: "flex", gap: "1rem", color: "var(--text-2)", marginTop: "0.5rem" }}>
                    <span>{selectedStory.category}</span>
                    <span>•</span>
                    <span style={{ color: getDifficultyColor(selectedStory.difficulty), fontWeight: "bold" }}>{selectedStory.difficulty}</span>
                  </div>
                </div>
              </div>

              <div style={{ 
                marginTop: "2rem", 
                lineHeight: "1.8", 
                fontSize: "1.1rem",
                color: "var(--text-1)",
                whiteSpace: "pre-wrap" 
              }}>
                {renderTextWithHighlights(selectedStory.content)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
