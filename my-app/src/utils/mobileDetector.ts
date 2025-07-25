// 모바일 기기 감지 유틸리티
export const isMobile = (): boolean => {
  // User Agent 기반 감지
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera;

  // 모바일 기기 패턴
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i,
    /Tablet/i,
  ];

  // 화면 크기 기반 감지 (추가)
  const isSmallScreen = window.innerWidth <= 768;

  // User Agent 또는 화면 크기로 모바일 판단
  return (
    mobilePatterns.some((pattern) => pattern.test(userAgent)) || isSmallScreen
  );
};

// 터치 지원 여부 확인
export const isTouchDevice = (): boolean => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// 모바일 + 터치 지원 확인 (지문인식 가능 여부)
export const isWebAuthnCapable = (): boolean => {
  return isMobile() && isTouchDevice();
};
