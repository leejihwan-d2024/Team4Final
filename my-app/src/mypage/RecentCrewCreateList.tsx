// components/RecentCrewJoinList.tsx
import React, { useEffect, useState } from "react";
import { fetchRecentCrewsCombined } from "../types/recent_crew";
import { MeasureSimpleDTO } from "../types/measure";

interface Props {
  userId: string;
}

const RecentCrewJoinList: React.FC<Props> = ({ userId }) => {
  const [crews, setCrews] = useState<MeasureSimpleDTO[]>([]);

  useEffect(() => {
    const loadCrews = async () => {
      try {
        const data = await fetchRecentCrewsCombined(userId);
        setCrews(data);
      } catch (err) {
        console.error("크루 활동 불러오기 실패:", err);
      }
    };

    loadCrews();
  }, [userId]);

  return (
    <div>
      <ul>
        {crews.map((item, index) => (
          <li key={index}>
            👥 {item.label} - {new Date(item.timestamp).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentCrewJoinList;
