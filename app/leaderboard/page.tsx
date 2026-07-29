"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Flame, Zap, ShieldCheck, Award, ArrowLeft, Star, Crown, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { getWords } from "@/lib/db";
import { Word } from "@/lib/types";
import { getRankLevel, RANK_LEVELS, RankLevel } from "@/lib/ranks";
import { getGamificationState, getLeaderboardData, BADGES, LeaderboardUser, GamificationState } from "@/lib/gamification";

export default function LeaderboardPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "ranks" | "badges">("leaderboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWords().then(w => {
      setWords(w);
      setGamification(getGamificationState());
      setLoading(false);
    });
  }, []);

  const masteredCount = words.filter(w => w.difficulty >= 3).length;
  const currentRank = getRankLevel(masteredCount);
  const { leaderboard, userRank } = getLeaderboardData(words);

  // Next rank calculation
  const nextRank = RANK_LEVELS.find(r => r.level === currentRank.level + 1);
  const wordsToNextRank = nextRank ? nextRank.minWords - masteredCount : 0;
  const progressPct = nextRank
    ? Math.min(100, Math.round(((masteredCount - currentRank.minWords) / (nextRank.minWords - currentRank.minWords)) * 100))
    : 100;

  if (loading || !gamification) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh", flexDirection: "column", gap: 16 }}>
        <div style={{
          fontSize: 16, fontWeight: 900, color: "#000",
          padding: "10px 20px", background: "#FFE052", border: "2.5px solid #000",
          borderRadius: 12, boxShadow: "4px 4px 0 #000",
        }}>
          🏆 ĐANG TẢI BẢNG XẾP HẠNG...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 18px 40px" }}>

      {/* Header Bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
        background: "#FFFFFF", border: "2.5px solid #000000", borderRadius: 18,
        padding: "16px 18px", boxShadow: "4px 4px 0px #000000",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn btn-secondary" style={{ padding: 10, borderRadius: 12 }}>
            <ArrowLeft size={18} color="#000000" strokeWidth={3} />
          </button>
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 900, fontSize: 20, color: "#000000" }}>
            <Trophy size={22} color="#FF5964" strokeWidth={3} />
            Bảng Xếp Hạng & Rank Hạng
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555555", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} color="#38E54D" strokeWidth={2.5} /> Chống gian lận (Anti-Cheat Active)
          </div>
        </div>
      </div>

      {/* Current Rank Hero Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
        <div style={{
          border: "2.5px solid #000000",
          borderRadius: 20,
          boxShadow: "5px 5px 0px #000000",
          padding: "20px 22px",
          background: currentRank.bg,
          color: currentRank.color,
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 900, textTransform: "uppercase",
                padding: "4px 10px", borderRadius: 99, background: "#FFFFFF", color: "#000000",
                border: "2px solid #000000", display: "inline-block", marginBottom: 10, boxShadow: "2px 2px 0 #000",
              }}>
                LEVEL {currentRank.level} · {currentRank.cefr}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1, textShadow: "1px 1px 0 #000" }}>
                {currentRank.badgeEmoji} {currentRank.name}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
                {currentRank.engName} ({masteredCount} từ đã thuộc)
              </div>
              {currentRank.equivalence && (
                <div style={{
                  fontSize: 11, fontWeight: 800, marginTop: 6, display: "inline-block",
                  padding: "3px 8px", background: "#FFFFFF", color: "#000000", border: "1.5px solid #000", borderRadius: 6,
                }}>
                  🎓 {currentRank.equivalence}
                </div>
              )}
            </div>

            {/* Rank Position Badge */}
            <div style={{
              background: "#FFFFFF", border: "2.5px solid #000000", borderRadius: 16,
              padding: "10px 14px", textAlign: "center", boxShadow: "3px 3px 0 #000", minWidth: 90,
            }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#666", textTransform: "uppercase" }}>HẠNG HIỆN TẠI</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#000000", lineHeight: 1.1 }}>#{userRank}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#000", marginTop: 2 }}>{gamification.xp} XP</div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
              <span>Tiến độ lên Level {currentRank.level + 1}</span>
              <span>{nextRank ? `${masteredCount}/${nextRank.minWords} từ (${progressPct}%)` : "Đã đạt cấp tối đa!"}</span>
            </div>
            <div style={{
              height: 14, border: "2px solid #000000", background: "#FFFFFF", borderRadius: 99,
              overflow: "hidden", boxShadow: "2px 2px 0 #000", position: "relative",
            }}>
              <div style={{
                height: "100%", background: "#FFE052", width: `${progressPct}%`,
                borderRight: progressPct > 0 ? "2px solid #000" : "none",
                transition: "width 0.5s ease",
              }} />
            </div>
            {nextRank && (
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, textAlign: "right" }}>
                Còn thiếu <span style={{ fontWeight: 900, textDecoration: "underline" }}>{wordsToNextRank} từ</span> nữa để lên <b>Level {nextRank.level}: {nextRank.name}</b>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { id: "leaderboard", label: "👑 Bảng Xếp Hạng", bg: "#FFE052" },
          { id: "ranks",       label: "🗺️ 12 Cấp Độ Rank", bg: "#9C8EFA" },
          { id: "badges",      label: "🏅 Huy Hiệu",        bg: "#FF8E53" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as any)} className="btn" style={{
            flex: 1, padding: "10px 8px", fontSize: 13,
            background: activeTab === t.id ? t.bg : "#FFFFFF",
            boxShadow: activeTab === t.id ? "4px 4px 0 #000" : "2px 2px 0 #000",
            transform: activeTab === t.id ? "translate(-1px, -1px)" : "none",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: LEADERBOARD ── */}
      {activeTab === "leaderboard" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Top 3 Podium Card */}
          <div style={{
            background: "#FFFFFF", border: "2.5px solid #000000", borderRadius: 20,
            boxShadow: "5px 5px 0 #000000", padding: "20px 16px 16px",
          }}>
            <div style={{ textAlign: "center", fontSize: 14, fontWeight: 900, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🏆 TOP 3 CAO THỦ HỌC TẬP HÀNG ĐẦU
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, alignItems: "flex-end" }}>

              {/* Rank 2 */}
              {leaderboard[1] && (
                <div style={{
                  background: "#EFEFEF", border: "2.5px solid #000", borderRadius: 14,
                  padding: "14px 8px", textAlign: "center", boxShadow: "3px 3px 0 #000",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🥈 {leaderboard[1].avatarEmoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {leaderboard[1].name}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginTop: 2 }}>
                    {leaderboard[1].masteredWords} từ
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 99, background: "#9C8EFA", border: "1px solid #000", display: "inline-block", marginTop: 4 }}>
                    {leaderboard[1].rankLevel.cefr}
                  </span>
                </div>
              )}

              {/* Rank 1 (Tallest Podium) */}
              {leaderboard[0] && (
                <div style={{
                  background: "#FFE052", border: "2.5px solid #000", borderRadius: 16,
                  padding: "18px 8px", textAlign: "center", boxShadow: "4px 4px 0 #000", transform: "translateY(-8px)"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>👑 {leaderboard[0].avatarEmoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {leaderboard[0].name}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#FF5964", marginTop: 2 }}>
                    {leaderboard[0].masteredWords} từ thuộc
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 99, background: "#FF5964", color: "#FFF", border: "1px solid #000", display: "inline-block", marginTop: 6 }}>
                    {leaderboard[0].rankLevel.name}
                  </span>
                </div>
              )}

              {/* Rank 3 */}
              {leaderboard[2] && (
                <div style={{
                  background: "#FF8E53", border: "2.5px solid #000", borderRadius: 14,
                  padding: "12px 8px", textAlign: "center", boxShadow: "3px 3px 0 #000",
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🥉 {leaderboard[2].avatarEmoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {leaderboard[2].name}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#000", marginTop: 2 }}>
                    {leaderboard[2].masteredWords} từ
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 99, background: "#FFFFFF", border: "1px solid #000", display: "inline-block", marginTop: 4 }}>
                    {leaderboard[2].rankLevel.cefr}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Full Rankings List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaderboard.map((user, index) => {
              const rankNum = index + 1;
              return (
                <div key={user.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: 14, border: "2.5px solid #000000",
                  background: user.isCurrentUser ? "#FFE052" : "#FFFFFF",
                  boxShadow: user.isCurrentUser ? "4px 4px 0px #000000" : "3px 3px 0px #000000",
                  transform: user.isCurrentUser ? "scale(1.01)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: rankNum === 1 ? "#FFE052" : rankNum === 2 ? "#EFEFEF" : rankNum === 3 ? "#FF8E53" : "#F5EFE6",
                      border: "2px solid #000", fontWeight: 900, fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "1.5px 1.5px 0 #000"
                    }}>
                      #{rankNum}
                    </div>

                    <div style={{ fontSize: 22 }}>{user.avatarEmoji}</div>

                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: "#000000", display: "flex", alignItems: "center", gap: 6 }}>
                        {user.name}
                        {user.isCurrentUser && (
                          <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 99, background: "#FF5964", color: "#FFF", border: "1px solid #000" }}>
                            BẠN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#555555", marginTop: 2 }}>
                        {user.rankLevel.badgeEmoji} Level {user.rankLevel.level}: {user.rankLevel.name} ({user.masteredWords} từ)
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#000000" }}>{user.xp} XP</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#FF5964", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                      <Flame size={12} fill="#FF5964" /> {user.streak} ngày
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── TAB 2: 12 LEVEL RANKS ── */}
      {activeTab === "ranks" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555555", textAlign: "center", marginBottom: 6 }}>
            Bảng 12 Cấp Độ Chuẩn Ngôn Ngữ (Tính Theo Số Từ Đã Học Thuộc)
          </div>

          {RANK_LEVELS.map(r => {
            const isCurrent = r.level === currentRank.level;
            const isUnlocked = masteredCount >= r.minWords;
            return (
              <div key={r.level} style={{
                background: isCurrent ? r.bg : isUnlocked ? "#FFFFFF" : "#F5EFE6",
                border: "2.5px solid #000000", borderRadius: 16,
                padding: "16px 18px", boxShadow: isCurrent ? "5px 5px 0 #000" : "3px 3px 0 #000",
                opacity: isUnlocked ? 1 : 0.65, position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: r.bg,
                      border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, boxShadow: "2px 2px 0 #000",
                    }}>
                      {r.badgeEmoji}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: "#000000", display: "flex", alignItems: "center", gap: 6 }}>
                        Level {r.level}: {r.name}
                        {isCurrent && (
                          <span style={{ fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 99, background: "#000", color: "#FFF" }}>
                            HIỆN TẠI
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#444444" }}>
                        {r.engName} · Chuẩn {r.cefr}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 900, padding: "4px 10px", borderRadius: 99,
                      background: isUnlocked ? "#38E54D" : "#FFFFFF", border: "1.5px solid #000", boxShadow: "1.5px 1.5px 0 #000",
                    }}>
                      {r.minWords === 0 ? "< 500 từ" : r.maxWords > 100000 ? `≥ ${r.minWords.toLocaleString()} từ` : `${r.minWords.toLocaleString()} - ${r.maxWords.toLocaleString()} từ`}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: "#2B2B2B", lineHeight: 1.4, marginTop: 6 }}>
                  {r.desc}
                </div>

                {r.equivalence && (
                  <div style={{
                    fontSize: 11, fontWeight: 800, marginTop: 8,
                    padding: "3px 8px", background: "#FFFFFF", color: "#000", border: "1.5px solid #000", borderRadius: 6, display: "inline-block"
                  }}>
                    🎓 Tương đương: {r.equivalence}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* ── TAB 3: BADGES ── */}
      {activeTab === "badges" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {BADGES.map(b => {
            const isUnlocked = gamification.unlockedBadges.includes(b.id);
            return (
              <div key={b.id} style={{
                background: isUnlocked ? b.bg : "#EFEFEF",
                border: "2.5px solid #000000", borderRadius: 16,
                padding: "16px 14px", boxShadow: isUnlocked ? "4px 4px 0 #000" : "2px 2px 0 #000",
                opacity: isUnlocked ? 1 : 0.55, textAlign: "center", position: "relative",
              }}>
                <div style={{ fontSize: 36, marginBottom: 6 }}>{b.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#000000", marginBottom: 2 }}>{b.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#2B2B2B", lineHeight: 1.3, marginBottom: 8 }}>{b.desc}</div>
                <span style={{
                  fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 99,
                  background: isUnlocked ? "#FFFFFF" : "#DDD", border: "1.5px solid #000", display: "inline-block"
                }}>
                  {isUnlocked ? "✓ ĐÃ MỞ KHÓA" : `🔒 ${b.conditionDesc}`}
                </span>
              </div>
            );
          })}
        </motion.div>
      )}

    </div>
  );
}
