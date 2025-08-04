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
  style?: React.CSSProperties;
}

interface Badge {
  achvTitle: string;
  achievedDate: string;
  badgeImageUrl: string;
  badgeName: string;
}

const ToggleBox: React.FC<ToggleBoxProps> = ({ userId, style }) => {
  const [active, setActive] = useState<"최근활동" | "업적">("최근활동");
  const [userBadges, setUserBadges] = useState<Badge[]>([]);

  const fetchUserBadges = async () => {
    const token = localStorage.getItem("token");

    if (!userId) {
      console.warn("❌ 유저 정보 없음, 뱃지 불러오기 중단");
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}api/achievements/badges`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        }
      );

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
        maxWidth: 400,
        // height: 300,  // 고정 높이 제거
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        height: "100%", // 여기 추가
        minHeight: 0, // 추가 (flexbox 스크롤 정상 작동)
        ...style,
      }}
    >
      {/* 고정된 탭 버튼 영역 */}
      <div
        style={{
          padding: "8px",
          flexShrink: 0,
          backgroundColor: "#f9f9f9",
          borderBottom: "1px solid #ccc",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
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
      </div>

      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div
        style={{
          overflowY: "auto",
          flexGrow: 1,
          padding: "10px",
          minHeight: 0, // flexbox에서 스크롤 정상 작동하게
        }}
        className="scroll-hidden"
      >
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
                      <img
                        src={badge.badgeImageUrl}
                        alt={badge.badgeName}
                        style={{ width: "50px", height: "50px" }}
                      />
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
