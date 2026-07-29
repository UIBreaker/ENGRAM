/**
 * lib/db.ts — Supabase data layer (replaces lib/storage.ts)
 * All functions are async and map snake_case DB columns ↔ camelCase TS types.
 */
import { supabase } from "./supabase";
import { Word, JournalEntry, StudySession, FlashcardRating, TopicTag } from "./types";

// ═══════════════════════════════════════════════════════
//  ROW MAPPERS
// ═══════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toWord(r: any): Word {
  return {
    id:           r.id,
    word:         r.word,
    phonetics:    r.phonetics  ?? "",
    meaning:      r.meaning,
    example:      r.example    ?? "",
    topic:        r.topic      as TopicTag,
    difficulty:   r.difficulty,
    nextReview:   r.next_review,
    lastReview:   r.last_review ?? null,
    reviewCount:  r.review_count,
    correctCount: r.correct_count,
    imageUrl:     r.image_url  ?? undefined,
    createdAt:    r.created_at,
  };
}

function wordToRow(data: Partial<Word>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = {};
  if (data.word         !== undefined) row.word          = data.word;
  if (data.phonetics    !== undefined) row.phonetics     = data.phonetics;
  if (data.meaning      !== undefined) row.meaning       = data.meaning;
  if (data.example      !== undefined) row.example       = data.example;
  if (data.topic        !== undefined) row.topic         = data.topic;
  if (data.difficulty   !== undefined) row.difficulty    = data.difficulty;
  if (data.nextReview   !== undefined) row.next_review   = data.nextReview;
  if (data.lastReview   !== undefined) row.last_review   = data.lastReview;
  if (data.reviewCount  !== undefined) row.review_count  = data.reviewCount;
  if (data.correctCount !== undefined) row.correct_count = data.correctCount;
  if ("imageUrl" in data)              row.image_url     = data.imageUrl ?? null;
  return row;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toJournal(r: any): JournalEntry {
  return {
    id:         r.id,
    date:       r.date,
    content:    r.content,
    aiFeedback: r.ai_feedback ?? null,
    wordCount:  r.word_count,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSession(r: any): StudySession {
  return {
    id:           r.id,
    date:         r.date,
    wordsStudied: r.words_studied,
    correctCount: r.correct_count,
  };
}

// ═══════════════════════════════════════════════════════
//  IN-MEMORY CACHE FOR HIGH PERFORMANCE
// ═══════════════════════════════════════════════════════
let wordsCache: { data: Word[]; timestamp: number } | null = null;
let sessionsCache: { data: StudySession[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 6000; // 6s TTL for ultra-fast navigation

export function clearDbCache() {
  wordsCache = null;
  sessionsCache = null;
}

// ═══════════════════════════════════════════════════════
//  WORDS
// ═══════════════════════════════════════════════════════
export async function getWords(): Promise<Word[]> {
  if (wordsCache && Date.now() - wordsCache.timestamp < CACHE_TTL_MS) {
    return wordsCache.data;
  }
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("getWords:", error.message); return wordsCache?.data ?? []; }
  const result = (data ?? []).map(toWord);
  wordsCache = { data: result, timestamp: Date.now() };
  return result;
}

export async function addWord(
  data: Omit<Word, "id" | "difficulty" | "nextReview" | "lastReview" | "reviewCount" | "correctCount" | "createdAt">
): Promise<Word> {
  wordsCache = null;
  const { data: row, error } = await supabase
    .from("words")
    .insert({
      word:          data.word,
      phonetics:     data.phonetics  || "",
      meaning:       data.meaning,
      example:       data.example    || "",
      topic:         data.topic,
      image_url:     data.imageUrl   || null,
      difficulty:    0,
      next_review:   new Date().toISOString(),
      last_review:   null,
      review_count:  0,
      correct_count: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toWord(row);
}

export async function updateWord(id: string, updates: Partial<Word>): Promise<void> {
  wordsCache = null;
  const { error } = await supabase
    .from("words")
    .update(wordToRow(updates))
    .eq("id", id);
  if (error) console.error("updateWord:", error.message);
}

export async function deleteWord(id: string): Promise<void> {
  wordsCache = null;
  const { error } = await supabase.from("words").delete().eq("id", id);
  if (error) console.error("deleteWord:", error.message);
}

// ═══════════════════════════════════════════════════════
//  SPACED REPETITION  (pure computation, no DB call)
// ═══════════════════════════════════════════════════════
const INTERVALS: Record<FlashcardRating, number> = {
  forgot: 1, remembered: 3, easy: 7,
};

/** Returns the computed updates — caller must persist via updateWord() */
export function applyRating(word: Word, rating: FlashcardRating): Partial<Word> {
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + INTERVALS[rating]);
  const isCorrect = rating !== "forgot";
  return {
    difficulty:   rating === "easy"   ? Math.min(word.difficulty + 1, 5)
                : rating === "forgot" ? Math.max(word.difficulty - 1, 0)
                : word.difficulty,
    nextReview:   nextReview.toISOString(),
    lastReview:   new Date().toISOString(),
    reviewCount:  word.reviewCount  + 1,
    correctCount: word.correctCount + (isCorrect ? 1 : 0),
  };
}

export async function getDueWords(): Promise<Word[]> {
  const { data, error } = await supabase
    .from("words")
    .select("*")
    .lte("next_review", new Date().toISOString())
    .order("next_review", { ascending: true });
  if (error) { console.error("getDueWords:", error.message); return []; }
  return (data ?? []).map(toWord);
}

// ═══════════════════════════════════════════════════════
//  JOURNAL
// ═══════════════════════════════════════════════════════
export async function getJournalEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("date", { ascending: false });
  if (error) { console.error("getJournalEntries:", error.message); return []; }
  return (data ?? []).map(toJournal);
}

export async function saveJournalEntry(
  entry: Omit<JournalEntry, "id" | "wordCount">
): Promise<JournalEntry> {
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;
  const { data: row, error } = await supabase
    .from("journal_entries")
    .upsert(
      { date: entry.date, content: entry.content, ai_feedback: entry.aiFeedback ?? null, word_count: wordCount },
      { onConflict: "date" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toJournal(row);
}

export async function updateJournalFeedback(id: string, aiFeedback: string): Promise<void> {
  const { error } = await supabase
    .from("journal_entries")
    .update({ ai_feedback: aiFeedback })
    .eq("id", id);
  if (error) console.error("updateJournalFeedback:", error.message);
}

// ═══════════════════════════════════════════════════════
//  STUDY SESSIONS
// ═══════════════════════════════════════════════════════
export async function getSessions(): Promise<StudySession[]> {
  if (sessionsCache && Date.now() - sessionsCache.timestamp < CACHE_TTL_MS) {
    return sessionsCache.data;
  }
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .order("date", { ascending: false });
  if (error) { console.error("getSessions:", error.message); return sessionsCache?.data ?? []; }
  const result = (data ?? []).map(toSession);
  sessionsCache = { data: result, timestamp: Date.now() };
  return result;
}

export async function recordSession(wordsStudied: number, correctCount: number): Promise<void> {
  sessionsCache = null;
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("study_sessions")
      .update({
        words_studied: existing.words_studied + wordsStudied,
        correct_count: existing.correct_count + correctCount,
      })
      .eq("date", today);
  } else {
    await supabase
      .from("study_sessions")
      .insert({ date: today, words_studied: wordsStudied, correct_count: correctCount });
  }
}

// ═══════════════════════════════════════════════════════
//  STREAK  (computed from study_sessions)
// ═══════════════════════════════════════════════════════
export async function getStreak(): Promise<number> {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("date")
    .order("date", { ascending: false })
    .limit(60);
  if (error || !data || data.length === 0) return 0;

  const today     = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (data[0].date !== today && data[0].date !== yesterday) return 0;

  let streak   = 0;
  let prevDate = "";
  for (const row of data) {
    if (!prevDate) { streak = 1; prevDate = row.date; continue; }
    const diff = Math.round(
      (new Date(prevDate + "T12:00:00").getTime() - new Date(row.date + "T12:00:00").getTime())
      / 86400000
    );
    if (diff === 1) { streak++; prevDate = row.date; } else break;
  }
  return streak;
}

// ═══════════════════════════════════════════════════════
//  SEED SAMPLE DATA (only if DB is empty)
// ═══════════════════════════════════════════════════════
export async function seedSampleData(): Promise<void> {
  try {
    const { data: existing } = await supabase.from("words").select("id").limit(1);
    if (existing && existing.length > 0) return; // already has data

    const samples = [
      { word: "Perseverance", phonetics: "/ˌpɜːrsɪˈvɪərəns/", meaning: "Sự kiên trì, bền bỉ",          example: "Success requires perseverance and hard work.",           topic: "Đời sống"  },
      { word: "Eloquent",     phonetics: "/ˈɛləkwənt/",         meaning: "Hùng hồn, biểu cảm tốt",       example: "She gave an eloquent speech at the conference.",       topic: "Học thuật" },
      { word: "Algorithm",    phonetics: "/ˈælɡərɪðəm/",        meaning: "Thuật toán",                     example: "The sorting algorithm runs in O(n log n) time.",       topic: "Lập trình" },
      { word: "Itinerary",    phonetics: "/aɪˈtɪnəreri/",        meaning: "Lịch trình chuyến đi",          example: "Let me check our itinerary for the trip.",            topic: "Du lịch"   },
      { word: "Synergy",      phonetics: "/ˈsɪnərdʒi/",          meaning: "Sức mạnh tổng hợp, hiệp lực",  example: "The merger created synergy between the two companies.", topic: "Công việc" },
      { word: "Ambiguous",    phonetics: "/æmˈbɪɡjuəs/",         meaning: "Mơ hồ, không rõ ràng",          example: "The instructions were ambiguous and hard to follow.",  topic: "Học thuật" },
      { word: "Refactor",     phonetics: "/ˌriːˈfæktər/",        meaning: "Tái cấu trúc code",              example: "We need to refactor this legacy codebase.",            topic: "Lập trình" },
      { word: "Resilient",    phonetics: "/rɪˈzɪliənt/",         meaning: "Có sức bền, phục hồi tốt",      example: "She is a resilient person who never gives up.",        topic: "Đời sống"  },
    ];

    const rows = samples.map((s, i) => {
      const next = new Date();
      next.setDate(next.getDate() - (i % 3));
      return {
        word: s.word, phonetics: s.phonetics, meaning: s.meaning,
        example: s.example, topic: s.topic,
        difficulty:    Math.floor(Math.random() * 3),
        next_review:   next.toISOString(),
        last_review:   i > 0 ? new Date(Date.now() - 86400000 * i).toISOString() : null,
        review_count:  Math.floor(Math.random() * 5),
        correct_count: Math.floor(Math.random() * 4),
      };
    });
    await supabase.from("words").insert(rows);

    // Seed sessions for the chart
    const sessionRows = [];
    for (let i = 6; i >= 0; i--) {
      if (i === 2) continue;
      const d = new Date(); d.setDate(d.getDate() - i);
      sessionRows.push({
        date:          d.toISOString().split("T")[0],
        words_studied: Math.floor(Math.random() * 10) + 3,
        correct_count: Math.floor(Math.random() * 8) + 2,
      });
    }
    await supabase.from("study_sessions").upsert(sessionRows, { onConflict: "date" });
  } catch (err) {
    console.error("seedSampleData:", err);
  }
}
