export interface RankLevel {
  level: number;
  name: string;
  engName: string;
  minWords: number;
  maxWords: number;
  group: "Nhóm Nhập môn & Căn bản" | "Nhóm Trung cấp" | "Nhóm Trung cao cấp" | "Nhóm Cao cấp & Thành thạo";
  cefr: string;
  color: string;
  bg: string;
  border: string;
  badgeEmoji: string;
  desc: string;
  equivalence?: string;
}

export const RANK_LEVELS: RankLevel[] = [
  {
    level: 1,
    name: "Mới bắt đầu",
    engName: "Absolute Beginner",
    minWords: 0,
    maxWords: 499,
    group: "Nhóm Nhập môn & Căn bản",
    cefr: "A0",
    color: "#000000",
    bg: "#EFEFEF",
    border: "#000000",
    badgeEmoji: "🐣",
    desc: "Nhận biết từ đơn lẻ phổ biến (con số, màu sắc, đồ vật quanh nhà, từ chào hỏi đơn giản).",
  },
  {
    level: 2,
    name: "Mới học lại",
    engName: "False Beginner",
    minWords: 500,
    maxWords: 999,
    group: "Nhóm Nhập môn & Căn bản",
    cefr: "A1",
    color: "#000000",
    bg: "#38E54D",
    border: "#000000",
    badgeEmoji: "🌿",
    desc: "Ghép được các câu đơn giản ngắn gọn. Nói thông tin cá nhân cơ bản (tên, tuổi, nghề nghiệp).",
  },
  {
    level: 3,
    name: "Sơ cấp",
    engName: "High Beginner / Elementary",
    minWords: 1000,
    maxWords: 1799,
    group: "Nhóm Nhập môn & Căn bản",
    cefr: "A2-",
    color: "#000000",
    bg: "#4ECCD3",
    border: "#000000",
    badgeEmoji: "🌱",
    desc: "Hỏi đường, mua sắm đơn giản, miêu tả thói quen hằng ngày. Động từ bất quy tắc phổ biến.",
  },
  {
    level: 4,
    name: "Tiền trung cấp",
    engName: "Pre-Intermediate",
    minWords: 1800,
    maxWords: 2499,
    group: "Nhóm Trung cấp",
    cefr: "A2+",
    color: "#000000",
    bg: "#FFE052",
    border: "#000000",
    badgeEmoji: "🍀",
    desc: "Phản xạ tốt trong du lịch, mua sắm. Nắm chắc khoảng 2.000 từ cốt lõi (Oxford 2000).",
  },
  {
    level: 5,
    name: "Trung cấp",
    engName: "Intermediate",
    minWords: 2500,
    maxWords: 3999,
    group: "Nhóm Trung cấp",
    cefr: "B1-",
    color: "#000000",
    bg: "#9C8EFA",
    border: "#000000",
    badgeEmoji: "📘",
    desc: "Tự tin giao tiếp hằng ngày. Hiểu ý chính bài báo, tin tức ngắn. Viết thư đơn giản.",
    equivalence: "450–600 TOEIC / 4.5–5.0 IELTS",
  },
  {
    level: 6,
    name: "Trung cấp vững",
    engName: "Mid-Intermediate",
    minWords: 4000,
    maxWords: 5499,
    group: "Nhóm Trung cấp",
    cefr: "B1+",
    color: "#000000",
    bg: "#FF8E53",
    border: "#000000",
    badgeEmoji: "🎓",
    desc: "Diễn đạt quan điểm cá nhân về chủ đề quen thuộc. Dùng phrasal verbs thông dụng.",
  },
  {
    level: 7,
    name: "Trung cao cấp",
    engName: "Pre-Advanced / Upper-Intermediate",
    minWords: 5500,
    maxWords: 7499,
    group: "Nhóm Trung cao cấp",
    cefr: "B2-",
    color: "#FFFFFF",
    bg: "#FF5964",
    border: "#000000",
    badgeEmoji: "⚔️",
    desc: "Giao tiếp trôi chảy với người bản xứ. Làm việc trong môi trường công sở quốc tế.",
    equivalence: "650–780 TOEIC / 5.5–6.0 IELTS",
  },
  {
    level: 8,
    name: "Trung cao cấp vững",
    engName: "High Upper-Intermediate",
    minWords: 7500,
    maxWords: 9999,
    group: "Nhóm Trung cao cấp",
    cefr: "B2+",
    color: "#000000",
    bg: "#FFE052",
    border: "#000000",
    badgeEmoji: "🏆",
    desc: "Đọc hiểu tài liệu chuyên ngành cơ bản, chuyện đùa, thành ngữ. Viết báo cáo rõ ràng.",
    equivalence: "785–900 TOEIC / 6.5–7.0 IELTS",
  },
  {
    level: 9,
    name: "Cao cấp",
    engName: "Advanced",
    minWords: 10000,
    maxWords: 13999,
    group: "Nhóm Cao cấp & Thành thạo",
    cefr: "C1-",
    color: "#FFFFFF",
    bg: "#FF70A6",
    border: "#000000",
    badgeEmoji: "💎",
    desc: "Ngôn ngữ linh hoạt, tự nhiên không suy nghĩ chọn từ. Viết & thuyết trình chuyên sâu.",
    equivalence: "7.5–8.0 IELTS",
  },
  {
    level: 10,
    name: "Cao cấp chuyên sâu",
    engName: "High Advanced",
    minWords: 14000,
    maxWords: 17999,
    group: "Nhóm Cao cấp & Thành thạo",
    cefr: "C1+",
    color: "#FFFFFF",
    bg: "#9C8EFA",
    border: "#000000",
    badgeEmoji: "🌟",
    desc: "Hiểu văn bản pháp lý, học thuật, văn học phức tạp. Nắm vững slang và thành ngữ cổ.",
  },
  {
    level: 11,
    name: "Thành thạo",
    engName: "Proficient / Mastery",
    minWords: 18000,
    maxWords: 21999,
    group: "Nhóm Cao cấp & Thành thạo",
    cefr: "C2",
    color: "#000000",
    bg: "#38E54D",
    border: "#000000",
    badgeEmoji: "👑",
    desc: "Ngang bản xứ có học vấn đại học. Nắm bắt cuộc hội thoại tốc độ nhanh và tiếng địa phương.",
  },
  {
    level: 12,
    name: "Chuyên gia ngôn ngữ",
    engName: "Near-Native / Expert",
    minWords: 22000,
    maxWords: 999999,
    group: "Nhóm Cao cấp & Thành thạo",
    cefr: "Expert",
    color: "#000000",
    bg: "#4ECCD3",
    border: "#000000",
    badgeEmoji: "🚀",
    desc: "Mức độ nghiên cứu sinh, nhà văn, biên dịch viên. Hiểu sâu lịch sử ngôn ngữ & thuật ngữ hẹp.",
  },
];

/**
 * Tính toán Rank Level dựa trên số từ vựng người dùng đã thuộc
 */
export function getRankLevel(masteredWordCount: number): RankLevel {
  const count = Math.max(0, masteredWordCount);
  for (let i = RANK_LEVELS.length - 1; i >= 0; i--) {
    if (count >= RANK_LEVELS[i].minWords) {
      return RANK_LEVELS[i];
    }
  }
  return RANK_LEVELS[0];
}
