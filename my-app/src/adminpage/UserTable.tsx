import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiBaseUrl } from "../utils/apiUtils";

interface User {
  userId: string;
  userPw: string;
  userNn: string;
  userEmail: string;
  userDefloc: string;
  userPhoneNo: string;
  userStatus: number;
  userSignUp: string;
  userLastLogin: string;
  userProfileImageUrl: string;
  userPoint: number;
  userActivePoint: number;
  kakaoId: string;
  provider: string;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios
      .get<User[]>(`${getApiBaseUrl()}users/all`)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Failed to fetch users", error));
  }, []);

  return (
    <div className="overflow-x-auto p-4">
      <h2 className="text-xl font-bold mb-4">전체 회원 목록</h2>
      <table className="min-w-full bg-white border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">닉네임</th>
            <th className="border px-2 py-1">이메일</th>
            <th className="border px-2 py-1">전화번호</th>
            <th className="border px-2 py-1">상태</th>
            <th className="border px-2 py-1">가입일</th>
            <th className="border px-2 py-1">최근 로그인</th>
            <th className="border px-2 py-1">보유포인트</th>
            <th className="border px-2 py-1">활동포인트</th>
            <th className="border px-2 py-1">프로필</th>
            <th className="border px-2 py-1">소셜</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userId} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{user.userId}</td>
              <td className="border px-2 py-1">{user.userNn}</td>
              <td className="border px-2 py-1">{user.userEmail}</td>
              <td className="border px-2 py-1">
                {/*user.userPhoneNo*/}###-####-####
              </td>
              <td className="border px-2 py-1">{user.userStatus}</td>
              <td className="border px-2 py-1">{user.userSignUp}</td>
              <td className="border px-2 py-1">{user.userLastLogin}</td>
              <td className="border px-2 py-1">{user.userPoint}</td>
              <td className="border px-2 py-1">{user.userActivePoint}</td>
              <td className="border px-2 py-1">
                {user.userProfileImageUrl ? (
                  <img src={user.userProfileImageUrl} alt="프로필" width={40} />
                ) : (
                  "없음"
                )}
              </td>
              <td className="border px-2 py-1">{user.provider}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
