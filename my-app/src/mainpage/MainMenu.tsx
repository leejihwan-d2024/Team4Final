import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/GG_axiosInstance";

function MainMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const userStr = localStorage.getItem("user");
  const user = JSON.parse(userStr || "null");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: user?.userId || "",
    userNn: user?.userNn || "",
    userEmail: user?.userEmail || "",
    userName: user?.userName || user?.userNn || "",
    profileImageUrl: user?.profileImageUrl || "",
    userPoint: user?.userPoint || "",
    userActivePoint: user?.userActivePoint || "",
    userStatus: user?.userStatus || "",
  });
  // 상태 메시지 관리
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const loadUserInfo = async (userId: string) => {
    setIsLoading(true);
    try {
      // 사용자 기본 정보 조회
      const userResponse = await api.get(`/api/user-profile/${userId}`);
      let profileImageUrl = "";

      // 프로필 이미지 URL 조회
      try {
        const imageResponse = await api.get(`/api/profile/${userId}`);
        if (imageResponse.data.success) {
          profileImageUrl = imageResponse.data.imageUrl;
        }
      } catch (imageError) {
        console.log("프로필 이미지 URL 조회 실패, 기본값 사용");
      }

      if (userResponse.data.success) {
        const userData = userResponse.data.userInfo;
        setUserInfo({
          userId: userData.userId || userId,
          userNn: userData.userNn || "",
          userEmail: userData.userEmail || "",
          userName: userData.userNn || "",
          profileImageUrl:
            userData.userProfileImageUrl || profileImageUrl || "",
          userPoint: userData?.userPoint || "",
          userActivePoint: userData?.userActivePoint || "",
          userStatus: userData?.userStatus || "",
        });
      }
    } catch (error) {
      console.error("사용자 정보 로드 실패:", error);
      setStatus({
        message: "사용자 정보를 불러오는데 실패했습니다.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (userInfo.userId) {
      loadUserInfo(userInfo.userId);
    }
  }, []);
  return (
    <>
      {/* 달리기, 메뉴 등은 기존 그대로 유지 */}
      <button
        type="button"
        className="fixed top-4 right-4 z-50 text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
        onClick={() => setMenuOpen(true)}
      >
        메뉴
      </button>
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 border-b font-bold text-lg">📋 메뉴</div>
        <ul className="p-4 space-y-4">
          <li>
            <Link to="/" className="text-blue-700 hover:underline">
              홈
            </Link>
          </li>
          <li>
            <Link to="/testmain" className="text-blue-700 hover:underline">
              🔧테스트메인
            </Link>
          </li>
          <li>
            <Link to="/FirstPage" className="text-blue-700 hover:underline">
              로그인페이지
            </Link>
          </li>
          <li>
            <Link to="/MainPage2" className="text-blue-700 hover:underline">
              크루메인
            </Link>
          </li>
          <li>
            <Link to="/CrewCreate" className="text-blue-700 hover:underline">
              크루생성
            </Link>
          </li>
          <li>
            <Link to="/achv" className="text-blue-700 hover:underline">
              업적
            </Link>
          </li>
          <li>
            <Link to="/posts" className="text-blue-700 hover:underline">
              게시판
            </Link>
          </li>
          <li>
            <Link to="/shop" className="text-blue-700 hover:underline">
              관련상품
            </Link>
          </li>
          <li>
            <Link to="/info" className="text-blue-700 hover:underline">
              관련정보
            </Link>
          </li>
          <li>
            <Link to="/marathon" className="text-blue-700 hover:underline">
              대회정보
            </Link>
          </li>
          <li>
            <Link
              to={`/mypage/${user?.userId}`}
              className="text-blue-700 hover:underline"
            >
              마이페이지
            </Link>
          </li>
          {userInfo ? (
            userInfo.userStatus === 2 ? (
              <li>
                <Link to={`/`} className="text-blue-700 hover:underline">
                  관리자페이지
                </Link>
              </li>
            ) : (
              <></>
            )
          ) : (
            <span>유저 정보 없음</span>
          )}
        </ul>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          ✖
        </button>
      </div>
    </>
  );
}

export default MainMenu;
