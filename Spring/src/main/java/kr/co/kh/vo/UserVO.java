package kr.co.kh.vo;

import lombok.Data;
import java.util.Date;

@Data
public class UserVO {
    private String userId;
    private String userPw;
    private String userNn;
    private String userEmail;
    private String userDefloc;
    private String userPhoneno;
    private int userStatus;
    private Date userSignUp;
    private Date userLastLogin;
    private String userProfileImageUrl;
    private int userPoint;
    private int userActivePoint;
    
    // 로그인 방식 구분 (LOCAL, KAKAO, GOOGLE 등)
    private String provider;
    
    // 카카오 ID (카카오 사용자의 경우)
    private String kakaoId;
    
    /**
     * 카카오 사용자인지 확인
     */
    public boolean isKakaoUser() {
        return "KAKAO".equals(provider) || (userId != null && userId.startsWith("kakao_"));
    }
    
    /**
     * 일반 사용자인지 확인
     */
    public boolean isLocalUser() {
        return "LOCAL".equals(provider) || (userId != null && !userId.startsWith("kakao_"));
    }
    
    /**
     * 사용자 타입을 문자열로 반환
     */
    public String getUserType() {
        if (isKakaoUser()) {
            return "카카오 사용자";
        } else if (isLocalUser()) {
            return "일반 사용자";
        } else {
            return "알 수 없음";
        }
    }
    
    /**
     * 로그인 방식 아이콘 또는 표시명 반환
     */
    public String getLoginMethodDisplay() {
        if (isKakaoUser()) {
            return "카카오";
        } else if (isLocalUser()) {
            return "일반";
        } else {
            return "기타";
        }
    }
}

