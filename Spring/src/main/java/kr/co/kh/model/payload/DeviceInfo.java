package kr.co.kh.model.payload;

import com.fasterxml.jackson.annotation.JsonValue;
import kr.co.kh.model.vo.DeviceType;
import kr.co.kh.validation.annotation.NullOrNotBlank;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class DeviceInfo {

    @NotBlank(message = "Device id cannot be blank")
    private String deviceId;

    @NotNull(message = "Device type cannot be null")
    private DeviceType deviceType;

    @NullOrNotBlank(message = "Device notification token can be null but not blank")
    private String notificationToken;

    public DeviceInfo() {
    }

    public DeviceInfo(String deviceId, DeviceType deviceType, String notificationToken) {
        this.deviceId = deviceId;
        this.deviceType = deviceType;
        this.notificationToken = notificationToken;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(DeviceType deviceType) {
        this.deviceType = deviceType;
    }

    public String getNotificationToken() {
        return notificationToken;
    }

    public void setNotificationToken(String notificationToken) {
        this.notificationToken = notificationToken;
    }

    /**
     * User-Agent를 기반으로 디바이스 타입을 자동 감지
     * @param userAgent User-Agent 문자열
     * @return 감지된 DeviceType
     */
    public static DeviceType detectDeviceType(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return DeviceType.OTHER;
        }
        
        String lowerUserAgent = userAgent.toLowerCase();
        
        // 모바일 디바이스 감지
        if (lowerUserAgent.contains("mobile") || 
            lowerUserAgent.contains("android") || 
            lowerUserAgent.contains("iphone") || 
            lowerUserAgent.contains("ipod") ||
            lowerUserAgent.contains("blackberry") ||
            lowerUserAgent.contains("windows phone")) {
            return DeviceType.MOBILE;
        }
        
        // 태블릿 디바이스 감지
        if (lowerUserAgent.contains("tablet") || 
            lowerUserAgent.contains("ipad") ||
            lowerUserAgent.contains("playbook")) {
            return DeviceType.TABLET;
        }
        
        // 데스크톱 OS 감지
        if (lowerUserAgent.contains("windows")) {
            return DeviceType.DEVICE_TYPE_WINDOWS;
        }
        
        if (lowerUserAgent.contains("mac os") || lowerUserAgent.contains("macintosh")) {
            return DeviceType.DEVICE_TYPE_MACOS;
        }
        
        // 기본값은 WEB
        return DeviceType.WEB;
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

    @Override
    public String toString() {
        return "DeviceInfo{" +
                "deviceId='" + deviceId + '\'' +
                ", deviceType=" + deviceType +
                ", notificationToken='" + notificationToken + '\'' +
                '}';
    }
}
