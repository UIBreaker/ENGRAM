export interface Word {
  id: string;
  word: string;
  phonetics: string;
  meaning: string;
  example: string;
  topic: TopicTag;
  difficulty: number; // 0 = new, 1-3 intervals
  nextReview: string; // ISO date string
  lastReview: string | null;
  reviewCount: number;
  correctCount: number;
  imageUrl?: string; // optional image for flashcard back
  createdAt: string;
}

export type TopicTag =
  | "Công việc"
  | "Lập trình"
  | "Đời sống"
  | "Du lịch"
  | "Học thuật"
  | "Khác";

export const TOPIC_TAGS: TopicTag[] = [
  "Công việc",
  "Lập trình",
  "Đời sống",
  "Du lịch",
  "Học thuật",
  "Khác",
];

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  aiFeedback: string | null;
  wordCount: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  wordsStudied: number;
  correctCount: number;
}

export type FlashcardRating = "forgot" | "remembered" | "easy";
