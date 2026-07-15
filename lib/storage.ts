import { Word, JournalEntry, StudySession, FlashcardRating } from "./types";
import { v4 as uuidv4 } from "uuid";

const KEYS = {
  words: "engram_words",
  journal: "engram_journal",
  sessions: "engram_sessions",
  streak: "engram_streak",
  lastStudy: "engram_last_study",
};

// ─── Words ───────────────────────────────────────────────────────────────────
export function getWords(): Word[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.words);
  return raw ? JSON.parse(raw) : [];
}

export function saveWords(words: Word[]) {
  localStorage.setItem(KEYS.words, JSON.stringify(words));
}

export function addWord(data: Omit<Word, "id" | "difficulty" | "nextReview" | "lastReview" | "reviewCount" | "correctCount" | "createdAt">): Word {
  const word: Word = {
    ...data,
    id: uuidv4(),
    difficulty: 0,
    nextReview: new Date().toISOString(),
    lastReview: null,
    reviewCount: 0,
    correctCount: 0,
    createdAt: new Date().toISOString(),
  };
  const words = getWords();
  saveWords([...words, word]);
  return word;
}

export function updateWord(id: string, updates: Partial<Word>) {
  const words = getWords().map((w) => (w.id === id ? { ...w, ...updates } : w));
  saveWords(words);
}

export function deleteWord(id: string) {
  saveWords(getWords().filter((w) => w.id !== id));
}

// ─── Spaced Repetition ───────────────────────────────────────────────────────
// Simple: forgot=1day, remembered=3days, easy=7days
const INTERVALS: Record<FlashcardRating, number> = {
  forgot: 1,
  remembered: 3,
  easy: 7,
};

export function applyRating(word: Word, rating: FlashcardRating): Word {
  const days = INTERVALS[rating];
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + days);

  const isCorrect = rating !== "forgot";
  return {
    ...word,
    difficulty: rating === "easy" ? Math.min(word.difficulty + 1, 5) : rating === "forgot" ? Math.max(word.difficulty - 1, 0) : word.difficulty,
    nextReview: nextReview.toISOString(),
    lastReview: new Date().toISOString(),
    reviewCount: word.reviewCount + 1,
    correctCount: word.correctCount + (isCorrect ? 1 : 0),
  };
}

export function getDueWords(): Word[] {
  const now = new Date();
  return getWords().filter((w) => new Date(w.nextReview) <= now);
}

// ─── Journal ─────────────────────────────────────────────────────────────────
export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.journal);
  return raw ? JSON.parse(raw) : [];
}

export function saveJournalEntry(entry: Omit<JournalEntry, "id" | "wordCount">): JournalEntry {
  const full: JournalEntry = {
    ...entry,
    id: uuidv4(),
    wordCount: entry.content.trim().split(/\s+/).filter(Boolean).length,
  };
  const entries = getJournalEntries();
  const existing = entries.findIndex((e) => e.date === entry.date);
  if (existing >= 0) {
    entries[existing] = full;
  } else {
    entries.unshift(full);
  }
  localStorage.setItem(KEYS.journal, JSON.stringify(entries));
  return full;
}

export function updateJournalFeedback(id: string, aiFeedback: string) {
  const entries = getJournalEntries().map((e) =>
    e.id === id ? { ...e, aiFeedback } : e
  );
  localStorage.setItem(KEYS.journal, JSON.stringify(entries));
}

// ─── Study Sessions ───────────────────────────────────────────────────────────
export function getSessions(): StudySession[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEYS.sessions);
  return raw ? JSON.parse(raw) : [];
}

export function recordSession(wordsStudied: number, correctCount: number) {
  const today = new Date().toISOString().split("T")[0];
  const sessions = getSessions();
  const existing = sessions.findIndex((s) => s.date === today);
  if (existing >= 0) {
    sessions[existing].wordsStudied += wordsStudied;
    sessions[existing].correctCount += correctCount;
  } else {
    sessions.push({ id: uuidv4(), date: today, wordsStudied, correctCount });
  }
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions));
  updateStreak(today);
}

// ─── Streak ───────────────────────────────────────────────────────────────────
export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(KEYS.streak) || "0", 10);
}

export function getLastStudyDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEYS.lastStudy);
}

function updateStreak(today: string) {
  const last = getLastStudyDate();
  const streak = getStreak();
  if (last === today) return;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];
  const newStreak = last === yStr ? streak + 1 : 1;
  localStorage.setItem(KEYS.streak, String(newStreak));
  localStorage.setItem(KEYS.lastStudy, today);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
export function seedSampleData() {
  if (getWords().length > 0) return;
  const samples: Omit<Word, "id" | "difficulty" | "nextReview" | "lastReview" | "reviewCount" | "correctCount" | "createdAt">[] = [
    { word: "Perseverance", phonetics: "/ˌpɜːrsɪˈvɪərəns/", meaning: "Sự kiên trì, bền bỉ", example: "Success requires perseverance and hard work.", topic: "Đời sống" },
    { word: "Eloquent", phonetics: "/ˈɛləkwənt/", meaning: "Hùng hồn, biểu cảm tốt", example: "She gave an eloquent speech at the conference.", topic: "Học thuật" },
    { word: "Algorithm", phonetics: "/ˈælɡərɪðəm/", meaning: "Thuật toán", example: "The sorting algorithm runs in O(n log n) time.", topic: "Lập trình" },
    { word: "Itinerary", phonetics: "/aɪˈtɪnəreri/", meaning: "Lịch trình chuyến đi", example: "Let me check our itinerary for the trip.", topic: "Du lịch" },
    { word: "Synergy", phonetics: "/ˈsɪnərdʒi/", meaning: "Sức mạnh tổng hợp, hiệp lực", example: "The merger created synergy between the two companies.", topic: "Công việc" },
    { word: "Ambiguous", phonetics: "/æmˈbɪɡjuəs/", meaning: "Mơ hồ, không rõ ràng", example: "The instructions were ambiguous and hard to follow.", topic: "Học thuật" },
    { word: "Refactor", phonetics: "/ˌriːˈfæktər/", meaning: "Tái cấu trúc code", example: "We need to refactor this legacy codebase.", topic: "Lập trình" },
    { word: "Resilient", phonetics: "/rɪˈzɪliənt/", meaning: "Có sức bền, phục hồi tốt", example: "She is a resilient person who never gives up.", topic: "Đời sống" },
  ];

  const words: Word[] = samples.map((s, i) => {
    const next = new Date();
    next.setDate(next.getDate() - (i % 3)); // some due today
    return {
      ...s,
      id: uuidv4(),
      difficulty: Math.floor(Math.random() * 3),
      nextReview: next.toISOString(),
      lastReview: i > 0 ? new Date(Date.now() - 86400000 * i).toISOString() : null,
      reviewCount: Math.floor(Math.random() * 5),
      correctCount: Math.floor(Math.random() * 4),
      createdAt: new Date(Date.now() - 86400000 * (8 - i)).toISOString(),
    };
  });
  saveWords(words);

  // seed some sessions for chart
  const sessions: StudySession[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (i !== 2) { // skip one day to show gap
      sessions.push({
        id: uuidv4(),
        date: d.toISOString().split("T")[0],
        wordsStudied: Math.floor(Math.random() * 10) + 3,
        correctCount: Math.floor(Math.random() * 8) + 2,
      });
    }
  }
  localStorage.setItem("engram_sessions", JSON.stringify(sessions));
  localStorage.setItem("engram_streak", "5");
  localStorage.setItem("engram_last_study", new Date().toISOString().split("T")[0]);
}
