import { useEffect, useState } from "react";

import RecentMeasureList from "./RecentMeasureList";
import PostsByAuthor from "../components/PostsByAuthor";
import axios from "../api/axiosInstance";
import RecentCrewJoinList from "./RecentCrewCreateList";

function isValidDate(value: string) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

interface ToggleBoxProps {
  userId: string | undefined;
}

interface Badge {
  achvTitle: string;
  achievedDate: string;
  badgeImageUrl: string;
  badgeName: string;
}

const ToggleBox: React.FC<ToggleBoxProps> = ({ userId }) => {
  const [active, setActive] = useState<"최근활동" | "업적">("최근활동");
  const [userBadges, setUserBadges] = useState<Badge[]>([]); // ✅ 뱃지 목록 상태 추가

  const fetchUserBadges = async () => {
    const token = localStorage.getItem("token");

    if (!userId) {
      console.warn("❌ 유저 정보 없음, 뱃지 불러오기 중단");
      return;
    }

    try {
      const response = await axios.get("/api/achievements/badges", {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId },
      });

      const camelCaseBadges = response.data.map((item: any) => ({
        achvTitle: item.ACHVTITLE ?? item.achvTitle ?? "제목 없음",
        achievedDate: item.ACHIEVEDDATE ?? item.achievedDate ?? "",
        badgeImageUrl:
          item.BADGEIMAGEURL?.trim() || item.badgeImageUrl?.trim() || "",
        badgeName: item.BADGENAME?.trim() || item.badgeName?.trim() || "",
      }));
      console.log("🔥 유저 뱃지", camelCaseBadges);
      setUserBadges(camelCaseBadges);
    } catch (err) {
      console.error("❌ 뱃지 목록 로딩 실패:", err);
    }
  };

  // ✅ active가 "업적"일 때만 뱃지 가져오기
  useEffect(() => {
    if (active === "업적") {
      fetchUserBadges();
    }
  }, [active]);

  return (
    <div
      style={{
        border: "2px solid #333",
        width: "100%",
        maxWidth: "400px",
        height: "200px",
        padding: "10px",
        boxSizing: "border-box",
        overflowY: "auto", // 수직 스크롤 가능
        scrollbarWidth: "none", // Firefox용 스크롤바 숨김
        msOverflowStyle: "none", // IE, Edge용 스크롤바 숨김
      }}
      className="scroll-hidden"
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        {["최근활동", "업적"].map((label) => (
          <button
            key={label}
            onClick={() => setActive(label as "최근활동" | "업적")}
            style={{
              padding: "6px 12px",
              border: "1px solid",
              borderColor: active === label ? "#007bff" : "#ccc",
              backgroundColor: active === label ? "#007bff" : "#f0f0f0",
              color: active === label ? "#fff" : "#000",
              fontWeight: active === label ? "bold" : "normal",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        {active === "최근활동" ? (
          <div>
            <RecentMeasureList userId={userId || ""} />
            <PostsByAuthor userId={userId} />
            <RecentCrewJoinList userId={userId || ""} />
          </div>
        ) : (
          <div>
            {userBadges.length > 0 && (
              <div className="badge-list">
                <div className="badge-grid">
                  {userBadges.map((badge, idx) => (
                    <div key={idx} className="badge-item">
                      <img src={badge.badgeImageUrl} alt={badge.badgeName} />
                      <div className="badge-name">{badge.badgeName}</div>
                      <div className="badge-date">
                        {isValidDate(badge.achievedDate)
                          ? new Date(badge.achievedDate).toLocaleDateString(
                              "ko-KR"
                            )
                          : "날짜 없음"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleBox;
