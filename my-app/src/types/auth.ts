// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 사용자 정보 타입
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  role?: string;
}

// 로그인 요청 타입
export interface LoginRequest {
  username: string;
  password: string;
  deviceInfo?: DeviceInfo;
}

// 카카오 로그인 요청 타입
export interface KakaoLoginRequest {
  code: string;
  deviceInfo?: DeviceInfo;
}

// 디바이스 정보 타입 (백엔드와 일치)
export interface DeviceInfo {
  deviceId: string;
  deviceType:
    | "WEB"
    | "MOBILE"
    | "TABLET"
    | "DEVICE_TYPE_ANDROID"
    | "DEVICE_TYPE_IOS"
    | "DEVICE_TYPE_WINDOWS"
    | "DEVICE_TYPE_MACOS"
    | "OTHER";
  notificationToken?: string;
}

// 인증 응답 타입
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// 로그인 폼 상태 타입
export interface LoginFormState {
  username: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}

// 디바이스 타입
export type DeviceType =
  | "WEB"
  | "MOBILE"
  | "TABLET"
  | "DEVICE_TYPE_ANDROID"
  | "DEVICE_TYPE_IOS"
  | "DEVICE_TYPE_WINDOWS"
  | "DEVICE_TYPE_MACOS"
  | "OTHER";

// 브라우저 정보 타입
export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  platform: string;
}
