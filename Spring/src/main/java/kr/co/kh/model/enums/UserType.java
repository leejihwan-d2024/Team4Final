package kr.co.kh.model.enums;

/**
 * 사용자 타입 Enum
 */
public enum UserType {
    LOCAL("일반 사용자", "일반"),
    KAKAO("카카오 사용자", "카카오"),
    GOOGLE("구글 사용자", "구글"),
    UNKNOWN("알 수 없음", "기타");

    private final String displayName;
    private final String shortName;

    UserType(String displayName, String shortName) {
        this.displayName = displayName;
        this.shortName = shortName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getShortName() {
        return shortName;
    }

    /**
     * provider 문자열로부터 UserType 반환
     */
    public static UserType fromProvider(String provider) {
        if (provider == null) return UNKNOWN;
        
        switch (provider.toUpperCase()) {
            case "LOCAL":
                return LOCAL;
            case "KAKAO":
                return KAKAO;
            case "GOOGLE":
                return GOOGLE;
            default:
                return UNKNOWN;
        }
    }

    /**
     * userId로부터 UserType 추정
     */
    public static UserType fromUserId(String userId) {
        if (userId == null) return UNKNOWN;
        
        if (userId.startsWith("kakao_")) {
            return KAKAO;
        } else if (userId.startsWith("google_")) {
            return GOOGLE;
        } else {
            return LOCAL;
        }
    }
} 