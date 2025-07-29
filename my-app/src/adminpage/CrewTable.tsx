import React, { useEffect, useState } from "react";
import axios from "axios";

interface Crew {
  crewId: string;
  crewTitle: string;
  leaderNn: string;
  startLocation: string;
  endLocation: string;
  district: string;
  createdAt: string;
  currentCount: number;
  distance: number | null;
  description: string | null;
  isOver15: number;
}

interface AddressMap {
  [key: string]: string;
}

const CrewTable: React.FC = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [startAddresses, setStartAddresses] = useState<AddressMap>({});
  const [endAddresses, setEndAddresses] = useState<AddressMap>({});

  // 주소 요청 함수 (axios 사용)
  const fetchAddress = async (lat: string, lng: string): Promise<string> => {
    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
        {
          headers: {
            Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07",
          },
        }
      );

      const documents = response.data.documents;
      if (!documents || documents.length === 0) return "주소 정보 없음";

      const region2 = documents[0].region_2depth_name;
      const region3 = documents[0].region_3depth_name;
      return `${region2} ${region3}`;
    } catch (error) {
      console.error("주소 가져오기 실패:", error);
      return "오류 발생";
    }
  };

  // 크루 데이터 불러오기 및 주소 변환
  useEffect(() => {
    const fetchCrews = async () => {
      try {
        const response = await axios.get<Crew[]>(
          "https://200.200.200.62:8080/api/crews"
        );
        setCrews(response.data);

        const startAddrPromises = response.data.map(async (crew) => {
          const [lat, lng] = crew.startLocation.split(",");
          const addr = await fetchAddress(lat.trim(), lng.trim());
          return { crewId: crew.crewId, addr };
        });

        const endAddrPromises = response.data.map(async (crew) => {
          const [lat, lng] = crew.endLocation.split(",");
          const addr = await fetchAddress(lat.trim(), lng.trim());
          return { crewId: crew.crewId, addr };
        });

        const startResults = await Promise.all(startAddrPromises);
        const endResults = await Promise.all(endAddrPromises);

        const startMap: AddressMap = {};
        const endMap: AddressMap = {};

        startResults.forEach(({ crewId, addr }) => {
          startMap[crewId] = addr;
        });
        endResults.forEach(({ crewId, addr }) => {
          endMap[crewId] = addr;
        });

        setStartAddresses(startMap);
        setEndAddresses(endMap);
      } catch (error) {
        console.error("크루 데이터를 불러오는데 실패했습니다.", error);
      }
    };

    fetchCrews();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">크루 목록</h2>
      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">#</th>
              <th className="border p-2">크루명</th>
              <th className="border p-2">리더 닉네임</th>
              <th className="border p-2">출발지</th>
              <th className="border p-2">도착지</th>
              <th className="border p-2">거리(km)</th>
              <th className="border p-2">인원</th>
              <th className="border p-2">구 분</th>
              <th className="border p-2">생성일</th>
            </tr>
          </thead>
          <tbody>
            {crews.map((crew, index) => (
              <tr key={crew.crewId} className="hover:bg-gray-50">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{crew.crewTitle}</td>
                <td className="border p-2">{crew.leaderNn}</td>
                <td className="border p-2">
                  {startAddresses[crew.crewId] || "로딩 중..."}
                </td>
                <td className="border p-2">
                  {endAddresses[crew.crewId] || "로딩 중..."}
                </td>
                <td className="border p-2">{crew.distance ?? "-"}</td>
                <td className="border p-2">{crew.currentCount}</td>
                <td className="border p-2">
                  {crew.isOver15 ? "15인 이상" : "15인 미만"}
                </td>
                <td className="border p-2">
                  {new Date(crew.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrewTable;
