package kr.co.kh.util;

import kr.co.kh.model.vo.DeviceType;
import lombok.extern.slf4j.Slf4j;

/**
 * 디바이스 타입 자동 감지 유틸리티
 */
@Slf4j
public class DeviceDetectionUtil {

    /**
     * User-Agent를 기반으로 디바이스 타입을 자동 감지
     * @param userAgent User-Agent 문자열
     * @return 감지된 DeviceType
     */
    public static DeviceType detectDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            log.debug("User-Agent가 null이거나 비어있음");
            return DeviceType.OTHER;
        }
        
        String lowerUserAgent = userAgent.toLowerCase();
        log.debug("User-Agent 분석: {}", userAgent);
        
        // 모바일 디바이스 감지
        if (isMobileDevice(lowerUserAgent)) {
            log.debug("모바일 디바이스 감지됨");
            return DeviceType.MOBILE;
        }
        
        // 태블릿 디바이스 감지
        if (isTabletDevice(lowerUserAgent)) {
            log.debug("태블릿 디바이스 감지됨");
            return DeviceType.TABLET;
        }
        
        // 데스크톱 OS 감지
        if (isWindowsDevice(lowerUserAgent)) {
            log.debug("Windows 디바이스 감지됨");
            return DeviceType.DEVICE_TYPE_WINDOWS;
        }
        
        if (isMacDevice(lowerUserAgent)) {
            log.debug("Mac 디바이스 감지됨");
            return DeviceType.DEVICE_TYPE_MACOS;
        }
        
        // 기본값은 WEB
        log.debug("웹 브라우저로 감지됨");
        return DeviceType.WEB;
    }
    
    /**
     * 모바일 디바이스인지 확인
     */
    private static boolean isMobileDevice(String userAgent) {
        return userAgent.contains("mobile") || 
               userAgent.contains("android") || 
               userAgent.contains("iphone") || 
               userAgent.contains("ipod") ||
               userAgent.contains("blackberry") ||
               userAgent.contains("windows phone") ||
               userAgent.contains("opera mini") ||
               userAgent.contains("mobile safari");
    }
    
    /**
     * 태블릿 디바이스인지 확인
     */
    private static boolean isTabletDevice(String userAgent) {
        return userAgent.contains("tablet") || 
               userAgent.contains("ipad") ||
               userAgent.contains("playbook") ||
               userAgent.contains("kindle") ||
               (userAgent.contains("android") && !userAgent.contains("mobile"));
    }
    
    /**
     * Windows 디바이스인지 확인
     */
    private static boolean isWindowsDevice(String userAgent) {
        return userAgent.contains("windows") && 
               !userAgent.contains("windows phone") &&
               !userAgent.contains("mobile");
    }
    
    /**
     * Mac 디바이스인지 확인
     */
    private static boolean isMacDevice(String userAgent) {
        return (userAgent.contains("mac os") || userAgent.contains("macintosh")) &&
               !userAgent.contains("iphone") &&
               !userAgent.contains("ipad") &&
               !userAgent.contains("ipod");
    }
    
    /**
     * 디바이스 ID 자동 생성
     * @param userAgent User-Agent 문자열
     * @param userId 사용자 ID (선택사항)
     * @return 생성된 디바이스 ID
     */
    public static String generateDeviceId(String userAgent, String userId) {
        DeviceType detectedType = detectDeviceType(userAgent);
        String timestamp = String.valueOf(System.currentTimeMillis());
        String userIdPart = userId != null ? "_" + userId : "";
        
        return detectedType.getValue().toLowerCase() + "_" + timestamp + userIdPart;
    }
    
    /**
     * 디바이스 정보 요약 생성
     * @param userAgent User-Agent 문자열
     * @return 디바이스 정보 요약
     */
    public static String getDeviceSummary(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown Device";
        }
        
        DeviceType deviceType = detectDeviceType(userAgent);
        String browser = getBrowserInfo(userAgent);
        String os = getOSInfo(userAgent);
        
        return String.format("%s - %s on %s", deviceType.getValue(), browser, os);
    }
    
    /**
     * 브라우저 정보 추출
     */
    private static String getBrowserInfo(String userAgent) {
        String lowerUserAgent = userAgent.toLowerCase();
        
        if (lowerUserAgent.contains("chrome")) return "Chrome";
        if (lowerUserAgent.contains("firefox")) return "Firefox";
        if (lowerUserAgent.contains("safari")) return "Safari";
        if (lowerUserAgent.contains("edge")) return "Edge";
        if (lowerUserAgent.contains("opera")) return "Opera";
        if (lowerUserAgent.contains("ie")) return "Internet Explorer";
        
        return "Unknown Browser";
    }
    
    /**
     * 운영체제 정보 추출
     */
    private static String getOSInfo(String userAgent) {
        String lowerUserAgent = userAgent.toLowerCase();
        
        if (lowerUserAgent.contains("windows")) return "Windows";
        if (lowerUserAgent.contains("mac os")) return "macOS";
        if (lowerUserAgent.contains("android")) return "Android";
        if (lowerUserAgent.contains("ios")) return "iOS";
        if (lowerUserAgent.contains("linux")) return "Linux";
        
        return "Unknown OS";
    }
} 