import { getRankLevel, RankLevel } from "./ranks";
import { Word } from "./types";

export interface Badge {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  color: string;
  bg: string;
  conditionDesc: string;
}

export const BADGES: Badge[] = [
  {
    id: "first_step",
    name: "Khởi Đầu",
    desc: "Thêm từ vựng đầu tiên vào kho từ vựng",
    emoji: "🥇",
    color: "#000000",
    bg: "#FFE052",
    conditionDesc: "Thêm 1 từ vựng bất kỳ",
  },
  {
    id: "streak_7",
    name: "Lửa Học Tập",
    desc: "Đạt chuỗi 7 ngày học liên tiếp",
    emoji: "🔥",
    color: "#FFFFFF",
    bg: "#FF5964",
    conditionDesc: "Duy trì Streak 7 ngày",
  },
  {
    id: "speed_demon",
    name: "Tốc Độ",
    desc: "Hoàn thành 1 phiên Ôn tập Nhanh 2 phút",
    emoji: "⚡",
    color: "#000000",
    bg: "#4ECCD3",
    conditionDesc: "Chạy chế độ ôn 2 phút",
  },
  {
    id: "intermediate_rank",
    name: "Trung Cấp",
    desc: "Đạt cấp độ Trung Cấp B1- (2.500+ từ)",
    emoji: "📘",
    color: "#000000",
    bg: "#9C8EFA",
    conditionDesc: "Đạt Level 5 trở lên",
  },
  {
    id: "ai_scholar",
    name: "AI Scholar",
    desc: "Hoàn thành 5 bài Luyện viết cùng AI",
    emoji: "✍️",
    color: "#000000",
    bg: "#FF8E53",
    conditionDesc: "Viết 5 câu cùng AI",
  },
  {
    id: "sharpshooter",
    name: "Xạ Thủ",
    desc: "Đạt 100% tỷ lệ chính xác trong bài Trắc nghiệm",
    emoji: "🎯",
    color: "#000000",
    bg: "#38E54D",
    conditionDesc: "Trả lời đúng 100% Quiz",
  },
  {
    id: "legend",
    name: "Huyền Thoại",
    desc: "Ghi nhớ sâu trên 1.000 từ vựng tiếng Anh",
    emoji: "👑",
    color: "#FFFFFF",
    bg: "#FF70A6",
    conditionDesc: "Thuộc 1.000+ từ vựng",
  },
];

export interface GamificationState {
  xp: number;
  streak: number;
  lastStudyDate: string; // YYYY-MM-DD local timezone
  unlockedBadges: string[];
  dailyXpEarned: number;
  lastXpActionTime: number; // anti-cheat timestamp
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarEmoji: string;
  xp: number;
  masteredWords: number;
  rankLevel: RankLevel;
  streak: number;
  isCurrentUser?: boolean;
}

const STORAGE_KEY = "engram_gamification_v1";

/** Anti-cheat configuration */
const ANTI_CHEAT_MIN_INTERVAL_MS = 400; // minimum 400ms between XP gains
const DAILY_XP_MAX_CAP = 2500; // maximum 2500 XP gain per day

export function getGamificationState(): GamificationState {
  if (typeof window === "undefined") {
    return { xp: 0, streak: 0, lastStudyDate: "", unlockedBadges: [], dailyXpEarned: 0, lastXpActionTime: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset daily XP earned if new date
      const today = getTodayLocalDate();
      if (parsed.lastStudyDate !== today) {
        parsed.dailyXpEarned = 0;
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading gamification state", err);
  }
  return {
    xp: 120, // default starting XP bonus
    streak: 1,
    lastStudyDate: getTodayLocalDate(),
    unlockedBadges: ["first_step"],
    dailyXpEarned: 0,
    lastXpActionTime: Date.now(),
  };
}

export function saveGamificationState(state: GamificationState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving gamification state", err);
  }
}

/**
 * Lấy ngày hôm nay theo múi giờ địa phương YYYY-MM-DD
 */
export function getTodayLocalDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Tăng điểm XP cho người dùng với cơ chế Anti-cheat
 */
export function addXP(amount: number, reason: string): { success: boolean; addedXP: number; newState: GamificationState } {
  const state = getGamificationState();
  const now = Date.now();

  // Anti-cheat 1: Time-gating anti-spam check
  if (now - state.lastXpActionTime < ANTI_CHEAT_MIN_INTERVAL_MS) {
    console.warn(`[Anti-Cheat] Rate limit triggered for XP action: ${reason}`);
    return { success: false, addedXP: 0, newState: state };
  }

  // Anti-cheat 2: Daily XP cap check
  const today = getTodayLocalDate();
  if (state.lastStudyDate !== today) {
    state.dailyXpEarned = 0;
    state.lastStudyDate = today;
  }

  if (state.dailyXpEarned >= DAILY_XP_MAX_CAP) {
    console.warn(`[Anti-Cheat] Daily XP cap reached (${DAILY_XP_MAX_CAP} XP)`);
    return { success: false, addedXP: 0, newState: state };
  }

  const cappedAmount = Math.min(amount, DAILY_XP_MAX_CAP - state.dailyXpEarned);
  state.xp += cappedAmount;
  state.dailyXpEarned += cappedAmount;
  state.lastXpActionTime = now;

  saveGamificationState(state);
  return { success: true, addedXP: cappedAmount, newState: state };
}

/**
 * Cập nhật Streak theo ngày học địa phương
 */
export function updateStreakOnStudy(): number {
  const state = getGamificationState();
  const today = getTodayLocalDate();

  if (state.lastStudyDate === today) {
    return state.streak; // already studied today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (state.lastStudyDate === yesterdayStr) {
    state.streak += 1;
  } else {
    state.streak = 1; // streak broken or reset
  }

  state.lastStudyDate = today;

  // Check streak 7 badge
  if (state.streak >= 7 && !state.unlockedBadges.includes("streak_7")) {
    state.unlockedBadges.push("streak_7");
  }

  saveGamificationState(state);
  return state.streak;
}

/**
 * Mở khóa huy hiệu mới
 */
export function unlockBadge(badgeId: string): boolean {
  const state = getGamificationState();
  if (!state.unlockedBadges.includes(badgeId)) {
    state.unlockedBadges.push(badgeId);
    saveGamificationState(state);
    return true;
  }
  return false;
}

/**
 * Bảng xếp hạng Real-time Simulated Sorted Set (Leaderboard)
 */
export function getLeaderboardData(words: Word[]): { leaderboard: LeaderboardUser[]; userRank: number } {
  const state = getGamificationState();
  const masteredCount = words.filter(w => w.difficulty >= 3).length;
  const userRankLevel = getRankLevel(masteredCount);

  // Simulated active community learners
  const simulatedLearners: LeaderboardUser[] = [
    { id: "1", name: "Minh Tuấn (IELTS 8.0)", avatarEmoji: "🦊", xp: 14200, masteredWords: 11200, rankLevel: getRankLevel(11200), streak: 42 },
    { id: "2", name: "Thanh Hằng (TOEIC 940)", avatarEmoji: "🦄", xp: 9800, masteredWords: 7800, rankLevel: getRankLevel(7800), streak: 28 },
    { id: "3", name: "Hoàng Nam", avatarEmoji: "🦁", xp: 7400, masteredWords: 5600, rankLevel: getRankLevel(5600), streak: 19 },
    { id: "4", name: "Phương Anh", avatarEmoji: "🐼", xp: 5200, masteredWords: 4100, rankLevel: getRankLevel(4100), streak: 14 },
    { id: "5", name: "Đức Anh Dev", avatarEmoji: "🚀", xp: 3900, masteredWords: 2900, rankLevel: getRankLevel(2900), streak: 11 },
    { id: "6", name: "Khánh Linh", avatarEmoji: "🐰", xp: 2800, masteredWords: 2100, rankLevel: getRankLevel(2100), streak: 8 },
    { id: "7", name: "Bảo Long", avatarEmoji: "🐯", xp: 1950, masteredWords: 1500, rankLevel: getRankLevel(1500), streak: 6 },
    { id: "8", name: "Ngọc Mai", avatarEmoji: "🐱", xp: 1200, masteredWords: 850, rankLevel: getRankLevel(850), streak: 5 },
    { id: "9", name: "Anh Khoa", avatarEmoji: "🐶", xp: 850, masteredWords: 420, rankLevel: getRankLevel(420), streak: 3 },
  ];

  // Current User
  const currentUser: LeaderboardUser = {
    id: "user_me",
    name: "Bạn (Bạn đang học)",
    avatarEmoji: "🌱",
    xp: state.xp,
    masteredWords: masteredCount,
    rankLevel: userRankLevel,
    streak: state.streak,
    isCurrentUser: true,
  };

  const all = [...simulatedLearners, currentUser].sort((a, b) => {
    if (b.masteredWords !== a.masteredWords) {
      return b.masteredWords - a.masteredWords;
    }
    return b.xp - a.xp;
  });

  const userIndex = all.findIndex(u => u.isCurrentUser);
  return {
    leaderboard: all,
    userRank: userIndex + 1,
  };
}
