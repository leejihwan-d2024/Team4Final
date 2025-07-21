import { DeviceInfo, DeviceType, BrowserInfo } from "../types/auth";

/**
 * 디바이스 정보 자동 생성 유틸리티
 */

/**
 * 디바이스 정보 생성 (백엔드와 일치하는 구조)
 * @returns {DeviceInfo} 디바이스 정보 객체
 */
export const createDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent;
  const deviceId = generateDeviceId();
  const deviceType = detectDeviceType(userAgent);

  return {
    deviceId: deviceId,
    deviceType: deviceType,
    // 웹 환경에서는 푸시 알림 토큰을 지원하지 않으므로 빈 문자열로 설정
    notificationToken: "",
  };
};

/**
 * 디바이스 ID 생성
 * @returns {string} 고유한 디바이스 ID
 */
const generateDeviceId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `device_${timestamp}_${random}`;
};

/**
 * User-Agent 기반 디바이스 타입 감지 (백엔드와 일치)
 * @param {string} userAgent User-Agent 문자열
 * @returns {DeviceType} 감지된 디바이스 타입
 */
const detectDeviceType = (userAgent: string): DeviceType => {
  const lowerUserAgent = userAgent.toLowerCase();

  // 모바일 디바이스 감지
  if (
    lowerUserAgent.includes("mobile") ||
    lowerUserAgent.includes("android") ||
    lowerUserAgent.includes("iphone") ||
    lowerUserAgent.includes("ipod") ||
    lowerUserAgent.includes("blackberry") ||
    lowerUserAgent.includes("windows phone") ||
    lowerUserAgent.includes("opera mini") ||
    lowerUserAgent.includes("mobile safari")
  ) {
    return "MOBILE";
  }

  // 태블릿 디바이스 감지
  if (
    lowerUserAgent.includes("tablet") ||
    lowerUserAgent.includes("ipad") ||
    lowerUserAgent.includes("playbook") ||
    lowerUserAgent.includes("kindle") ||
    (lowerUserAgent.includes("android") && !lowerUserAgent.includes("mobile"))
  ) {
    return "TABLET";
  }

  // Windows 디바이스 감지
  if (
    lowerUserAgent.includes("windows") &&
    !lowerUserAgent.includes("windows phone") &&
    !lowerUserAgent.includes("mobile")
  ) {
    return "DEVICE_TYPE_WINDOWS";
  }

  // Mac 디바이스 감지
  if (
    (lowerUserAgent.includes("mac os") ||
      lowerUserAgent.includes("macintosh")) &&
    !lowerUserAgent.includes("iphone") &&
    !lowerUserAgent.includes("ipad") &&
    !lowerUserAgent.includes("ipod")
  ) {
    return "DEVICE_TYPE_MACOS";
  }

  // 기본값은 WEB
  return "WEB";
};

/**
 * 디바이스 정보 요약 생성
 * @param {string} userAgent User-Agent 문자열
 * @returns {string} 디바이스 정보 요약
 */
export const getDeviceSummary = (userAgent: string): string => {
  if (!userAgent || userAgent.length === 0) {
    return "Unknown Device";
  }

  const deviceType = detectDeviceType(userAgent);
  const browser = getBrowserInfo(userAgent);
  const os = getOSInfo(userAgent);

  return `${deviceType} - ${browser.name} on ${os}`;
};

/**
 * 브라우저 정보 추출
 * @param {string} userAgent User-Agent 문자열
 * @returns {BrowserInfo} 브라우저 정보
 */
const getBrowserInfo = (userAgent: string): BrowserInfo => {
  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("chrome")) {
    return { name: "Chrome", version: "", os: "", platform: "" };
  }
  if (lowerUserAgent.includes("firefox")) {
    return { name: "Firefox", version: "", os: "", platform: "" };
  }
  if (lowerUserAgent.includes("safari")) {
    return { name: "Safari", version: "", os: "", platform: "" };
  }
  if (lowerUserAgent.includes("edge")) {
    return { name: "Edge", version: "", os: "", platform: "" };
  }
  if (lowerUserAgent.includes("opera")) {
    return { name: "Opera", version: "", os: "", platform: "" };
  }
  if (lowerUserAgent.includes("ie")) {
    return { name: "Internet Explorer", version: "", os: "", platform: "" };
  }

  return { name: "Unknown Browser", version: "", os: "", platform: "" };
};

/**
 * 운영체제 정보 추출
 * @param {string} userAgent User-Agent 문자열
 * @returns {string} 운영체제 이름
 */
const getOSInfo = (userAgent: string): string => {
  const lowerUserAgent = userAgent.toLowerCase();

  if (lowerUserAgent.includes("windows")) return "Windows";
  if (lowerUserAgent.includes("mac os")) return "macOS";
  if (lowerUserAgent.includes("android")) return "Android";
  if (lowerUserAgent.includes("ios")) return "iOS";
  if (lowerUserAgent.includes("linux")) return "Linux";

  return "Unknown OS";
};

/**
 * 디바이스 정보 디버깅 로그
 */
export const logDeviceInfo = (): DeviceInfo => {
  const deviceInfo = createDeviceInfo();
  console.log("=== 디바이스 정보 ===");
  console.log("User-Agent:", navigator.userAgent);
  console.log("Platform:", navigator.platform);
  console.log("Language:", navigator.language);
  console.log("Detected Device Type:", deviceInfo.deviceType);
  console.log("Generated Device ID:", deviceInfo.deviceId);
  console.log("Device Summary:", getDeviceSummary(navigator.userAgent));
  console.log("========================");

  return deviceInfo;
};
