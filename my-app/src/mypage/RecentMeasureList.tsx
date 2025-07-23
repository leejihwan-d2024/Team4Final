// components/RecentMeasureList.tsx

import React, { useEffect, useState } from "react";
import { fetchRecentMeasures } from "../api/measure";
import { MeasureSimpleDTO } from "../types/measure";

interface Props {
  userId: string;
}

const RecentMeasureList: React.FC<Props> = ({ userId }) => {
  const [measures, setMeasures] = useState<MeasureSimpleDTO[]>([]);

  useEffect(() => {
    const loadMeasures = async () => {
      try {
        const data = await fetchRecentMeasures(userId);
        setMeasures(data);
      } catch (error) {
        console.error("측정 활동 목록 불러오기 실패:", error);
      }
    };

    loadMeasures();
  }, [userId]);

  return (
    <div>
      <ul>
        {measures.map((item, index) => (
          <li key={index}>
            🏃 {item.label} - {new Date(item.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentMeasureList;
