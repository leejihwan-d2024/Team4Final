// api/crew.ts
import axios from "../api/axiosInstance";
import { getApiBaseUrl } from "../utils/apiUtils";
import { MeasureSimpleDTO } from "../types/measure";

export const fetchRecentCrewsCombined = async (
  userId: string
): Promise<MeasureSimpleDTO[]> => {
  const joinPromise = axios.get(
    `${getApiBaseUrl()}api/crews/getrecentjoin/${userId}`
  );
  const createPromise = axios.get(
    `${getApiBaseUrl()}api/crews/getrecentcreate/${userId}`
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
