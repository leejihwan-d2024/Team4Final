// api/crew.ts
import axios from "../api/axiosInstance";
import { MeasureSimpleDTO } from "../types/measure";

export const fetchRecentCrewsCombined = async (
  userId: string
): Promise<MeasureSimpleDTO[]> => {
  const joinPromise = axios.get(
    `${process.env.REACT_APP_API_BASE_URL}api/crews/getrecentjoin/${userId}`
  );
  const createPromise = axios.get(
    `${process.env.REACT_APP_API_BASE_URL}api/crews/getrecentcreate/${userId}`
  );

  const [joinResponse, createResponse] = await Promise.all([
    joinPromise,
    createPromise,
  ]);

  const joinData = joinResponse.data.map((item: any) => ({
    label: "크루 참가활동함",
    timestamp: item.JOINED_TIME,
  }));

  const createData = createResponse.data.map((item: any) => ({
    label: "크루 생성함",
    timestamp: item.CREATED_TIME,
  }));

  const combined = [...joinData, ...createData];

  // 날짜 기준 내림차순 정렬 (최신이 위로)
  combined.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return combined;
};
