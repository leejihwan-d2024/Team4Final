package kr.co.kh.vo;

import lombok.Data;
import java.util.Date;

@Data
public class UserVO {
    // 기본 사용자 정보
    private String userId;           // 사용자 고유 ID
    private String userPw;           // 사용자 비밀번호
    private String userNn;           // 사용자 닉네임
    private String userEmail;        // 사용자 이메일
    private String userDefloc;       // 사용자 기본 위치
    private String userPhoneno;      // 사용자 전화번호
    private int userStatus;          // 사용자 상태 (1: 활성, 0: 비활성)
    private Date userSignUp;         // 가입일
    private Date userLastLogin;      // 마지막 로그인일
    private int userPoint;           // 사용자 포인트
    private int userActivePoint;     // 활성 포인트
    
    // 프로필 이미지 관련
    private String userProfileImageUrl;  // 프로필 이미지 URL (카카오/일반 사용자 공통)
    
    // 소셜 로그인 관련
    private String provider;         // 로그인 방식 구분 (LOCAL, KAKAO, GOOGLE 등)
    // private String kakaoId;          // 카카오 ID *****(userId 와 통합 사용됨)*****
    
    // 카카오 사용자 관련 추가 필드 (필요시 확장)
    private String kakaoProfileImageUrl;  // 카카오 원본 프로필 이미지 URL
    // private String kakaoNickname;         // 카카오 원본 닉네임 *****(userNn 와 통합 사용됨)*****
}

