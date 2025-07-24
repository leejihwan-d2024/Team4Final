import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./CrewCreate.module.css"; // 재활용 OK
import api from "../api/GG_axiosInstance";
import PathMap from "../mainpage/PathMap";

export default function CrewEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    startLocation: "",
    endLocation: "",
    distance: "", // km, 자동 계산
    duration: "", // 분, 입력
    pace: "", // 분/km, 자동 계산 및 수정 가능
    description: "",
    isOver15: false,
    startLocationMapPoint: "",
    endLocationMapPoint: "",
  });

  const [pathPoints, setPathPoints] = useState<{ lat: number; lng: number }[]>(
    []
  );

  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");

  const [isAutoDescription, setIsAutoDescription] = useState(true); // 설명 자동입력 여부

  // 거리 계산 함수 (지구 반경 이용)
  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // 경로 전체 거리 계산
  function calculateTotalDistance(points: { lat: number; lng: number }[]) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng
      );
    }
    return total;
  }

  // 서버에서 기존 크루 데이터 불러오기
  useEffect(() => {
    const fetchCrew = async () => {
      try {
        const res = await api.get(`/api/crews/${id}`);
        const crew = res.data;

        setForm({
          title: crew.crewTitle,
          startLocation: crew.startLocation,
          endLocation: crew.endLocation,
          distance: crew.distance || "",
          duration: crew.duration || "",
          pace: crew.pace || "",
          description: crew.description || "",
          isOver15: crew.isOver15 === 1,
          startLocationMapPoint: crew.startLocationMapPoint || "",
          endLocationMapPoint: crew.endLocationMapPoint || "",
        });

        // 좌표가 있으면 pathPoints 상태로 변환해서 지도에 표시 가능하게 세팅
        const parseLatLng = (pointStr: string) => {
          const [latStr, lngStr] = pointStr.split(",");
          return { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
        };

        if (crew.startLocationMapPoint && crew.endLocationMapPoint) {
          setPathPoints([
            parseLatLng(crew.startLocationMapPoint),
            parseLatLng(crew.endLocationMapPoint),
          ]);
        }

        // 주소도 세팅
        setStartAddress(crew.district || "");
        setEndAddress(crew.district || ""); // 혹시 다른 주소가 있으면 별도 처리 가능
      } catch (err) {
        console.error("❌ 크루 정보 불러오기 실패:", err);
        alert("크루 정보를 불러오지 못했습니다.");
      }
    };
    fetchCrew();
  }, [id]);

  // pathPoints 바뀌면 거리 자동 계산해서 form에 반영
  useEffect(() => {
    if (pathPoints.length < 2) return;

    const totalDistance = calculateTotalDistance(pathPoints);
    setForm((prev) => ({
      ...prev,
      distance: totalDistance.toFixed(2),
    }));
  }, [pathPoints]);

  // 출발지 주소 변환 (카카오 API)
  useEffect(() => {
    if (pathPoints.length === 0) return;
    const start = pathPoints[0];

    fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${start.lng}&y=${start.lat}`,
      {
        method: "GET",
        headers: { Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const region2 = data.documents[0].region_2depth_name;
          const region3 = data.documents[0].region_3depth_name;
          const addr = `${region2} ${region3}`;
          setStartAddress(addr);
          setForm((prev) => ({
            ...prev,
            startLocation: `${start.lat},${start.lng}`,
            startLocationMapPoint: `${start.lat},${start.lng}`,
            district: addr, // 지역 정보 갱신
          }));
        } else {
          setStartAddress("주소 정보 없음");
        }
      })
      .catch(() => setStartAddress("오류 발생"));
  }, [pathPoints]);

  // 도착지 주소 변환 (카카오 API)
  useEffect(() => {
    if (pathPoints.length === 0) return;
    const end = pathPoints[pathPoints.length - 1];

    fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${end.lng}&y=${end.lat}`,
      {
        method: "GET",
        headers: { Authorization: "KakaoAK 940ad44b82d7651f1eafdd0d4758cc07" },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.documents && data.documents.length > 0) {
          const region2 = data.documents[0].region_2depth_name;
          const region3 = data.documents[0].region_3depth_name;
          const addr = `${region2} ${region3}`;
          setEndAddress(addr);
          setForm((prev) => ({
            ...prev,
            endLocation: `${end.lat},${end.lng}`,
            endLocationMapPoint: `${end.lat},${end.lng}`,
          }));
        } else {
          setEndAddress("주소 정보 없음");
        }
      })
      .catch(() => setEndAddress("오류 발생"));
  }, [pathPoints]);

  // duration 또는 distance 변경 시 pace 자동 계산
  useEffect(() => {
    const durationNum = Number(form.duration);
    const distanceNum = Number(form.distance);

    if (!durationNum || !distanceNum) {
      setForm((prev) => ({ ...prev, pace: "" }));
      return;
    }

    const pace = durationNum / distanceNum;
    setForm((prev) => ({
      ...prev,
      pace: pace.toFixed(2),
    }));
  }, [form.duration, form.distance]);

  // 설명 자동입력
  useEffect(() => {
    if (!isAutoDescription) return;
    if (form.duration && form.pace) {
      setForm((prev) => ({
        ...prev,
        description: `시간: ${prev.duration}분 / 페이스: ${prev.pace}분/km\n추가 설명을 입력해주세요.`,
      }));
    }
  }, [form.duration, form.pace, isAutoDescription]);

  // input, textarea 변경 이벤트
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "pace") {
      if (!/^\d*\.?\d*$/.test(value)) return; // 숫자 + 소수점만 허용
    }

    // 사용자가 설명을 직접 수정하면 자동입력 중단
    if (name === "description") {
      setIsAutoDescription(false);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.put(`/api/crews/${id}?userId=1`, {
        crewTitle: form.title,
        startLocation: form.startLocation,
        endLocation: form.endLocation,
        startLocationMapPoint: form.startLocationMapPoint,
        endLocationMapPoint: form.endLocationMapPoint,
        district: startAddress,
        isOver15: form.isOver15 ? 1 : 0,
        distance: form.distance,
        duration: form.duration,
        pace: form.pace,
        description: form.description,
      });

      alert("수정 완료!");
      navigate(`/crews/${id}`);
    } catch (err) {
      console.error("❌ 수정 실패:", err);
      alert("수정 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>크루 수정</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="title"
          placeholder="크루 제목"
          value={form.title}
          onChange={handleChange}
          required
        />

        {/* 숨김 필드 (좌표 직접 입력은 하지 않음) */}
        <input
          name="startLocation"
          value={form.startLocation}
          hidden
          readOnly
        />
        <input
          name="startLocationString"
          placeholder="출발지 지역명"
          value={startAddress}
          readOnly
        />

        {/* 지도 컴포넌트 */}
        <PathMap
          measurementId={7}
          setPathPoints={setPathPoints}
          CrewId={id || ""}
        />

        <input name="endLocation" value={form.endLocation} hidden readOnly />
        <input
          name="endLocationString"
          placeholder="도착지 지역명"
          value={endAddress}
          readOnly
        />

        <input
          name="distance"
          placeholder="거리 (km)"
          value={form.distance}
          readOnly
          required
        />

        <input
          name="duration"
          placeholder="목표시간 (분)"
          value={form.duration}
          onChange={handleChange}
          required
          type="number"
          min="1"
        />

        <input
          name="pace"
          placeholder="페이스 (1km당 소요시간)"
          value={form.pace}
          onChange={handleChange}
          required
          type="number"
          step="0.01"
          min="0"
        />

        <textarea
          name="description"
          placeholder="설명"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />

        <label>
          <input
            type="checkbox"
            name="isOver15"
            checked={form.isOver15}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, isOver15: e.target.checked }))
            }
          />
          크루원 15명 이상 허용
        </label>

        <button type="submit" className={styles.submitBtn}>
          수정 완료
        </button>
      </form>
    </div>
  );
}
