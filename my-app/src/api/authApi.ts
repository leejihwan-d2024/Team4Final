/**
 * 인증 관련 API 함수들
 */

import { createDeviceInfo, logDeviceInfo } from "../utils/deviceUtils";
import {
  LoginRequest,
  KakaoLoginRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "../types/auth";

const API_BASE_URL = "http://localhost:8080";

/**
 * 로그인 API
 * @param {string} username 사용자명
 * @param {string} password 비밀번호
 * @returns {Promise<AuthResponse>} 로그인 응답
 */
export const login = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  try {
    // 디바이스 정보 로깅 (백엔드에서 자동 생성하므로 보내지 않음)
    logDeviceInfo();

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        // deviceInfo는 백엔드에서 자동 생성하므로 제외
      } as LoginRequest),
    });

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;
      throw new Error(errorData.message || `로그인 실패 (${response.status})`);
    }

    const data = (await response.json()) as AuthResponse;
    console.log("로그인 성공:", data);
    return data;
  } catch (error) {
    console.error("로그인 오류:", error);
    throw error;
  }
};

/**
 * 카카오 로그인 API
 * @param {string} code 카카오 인증 코드
 * @returns {Promise<AuthResponse>} 카카오 로그인 응답
 */
export const kakaoLogin = async (code: string): Promise<AuthResponse> => {
  try {
    // 디바이스 정보 로깅 (백엔드에서 자동 생성하므로 보내지 않음)
    logDeviceInfo();

    const response = await fetch(`${API_BASE_URL}/api/auth/kakao/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        // deviceInfo는 백엔드에서 자동 생성하므로 제외
      } as KakaoLoginRequest),
    });

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;
      throw new Error(
        errorData.message || `카카오 로그인 실패 (${response.status})`
      );
    }

    const data = (await response.json()) as AuthResponse;
    console.log("카카오 로그인 성공:", data);
    return data;
  } catch (error) {
    console.error("카카오 로그인 오류:", error);
    throw error;
  }
};

/**
 * 로그아웃 API
 * @param {string} token 액세스 토큰
 * @returns {Promise<ApiResponse>} 로그아웃 응답
 */
export const logout = async (token: string): Promise<ApiResponse> => {
  try {
    // 디바이스 정보 자동 생성
    const deviceInfo = createDeviceInfo();

    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceInfo: deviceInfo,
      }),
    });

    if (!response.ok) {
      const errorData = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;
      throw new Error(
        errorData.message || `로그아웃 실패 (${response.status})`
      );
    }

    const data = (await response.json()) as ApiResponse;
    console.log("로그아웃 성공:", data);
    return data;
  } catch (error) {
    console.error("로그아웃 오류:", error);
    throw error;
  }
};

/**
 * 서버 상태 확인 API
 * @returns {Promise<ApiResponse>} 서버 상태 응답
 */
export const checkServerStatus = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`서버 연결 실패 (${response.status})`);
    }

    const data = (await response.json()) as ApiResponse;
    console.log("서버 상태 확인 성공:", data);
    return data;
  } catch (error) {
    console.error("서버 상태 확인 오류:", error);
    throw error;
  }
};
