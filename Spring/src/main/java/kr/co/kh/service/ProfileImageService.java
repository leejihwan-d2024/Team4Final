package kr.co.kh.service;

import kr.co.kh.vo.UserVO;

/**
 * 프로필 이미지 URL 관리 서비스 인터페이스
 */
public interface ProfileImageService {
    
    /**
     * 프로필 이미지 URL 업데이트
     * @param userId 사용자 ID
     * @param imageUrl 새로운 이미지 URL
     * @return 업데이트 성공 여부
     */
    boolean updateProfileImageUrl(String userId, String imageUrl);
    
    /**
     * 프로필 이미지 URL 조회
     * @param userId 사용자 ID
     * @return 프로필 이미지 URL
     */
    String getProfileImageUrl(String userId);
    
    /**
     * 프로필 이미지 URL 삭제 (기본값으로 설정)
     * @param userId 사용자 ID
     * @return 삭제 성공 여부
     */
    boolean deleteProfileImageUrl(String userId);
    
    /**
     * 이미지 URL 유효성 검사
     * @param imageUrl 검사할 이미지 URL
     * @return 유효성 여부
     */
    boolean isValidImageUrl(String imageUrl);
    
    /**
     * 사용자에게 적합한 프로필 이미지 URL 반환
     * 카카오 사용자는 카카오 이미지 우선, 일반 사용자는 기본 프로필 이미지
     */
    String getDisplayProfileImageUrl(UserVO user);
    
    /**
     * 카카오 사용자의 카카오 프로필 이미지 존재 여부 확인
     */
    boolean hasKakaoProfileImage(UserVO user);
    
    /**
     * 사용자의 프로필 이미지 설정 여부 확인
     */
    boolean hasProfileImage(UserVO user);
    
    /**
     * 기본 프로필 이미지 URL 반환
     */
    String getDefaultProfileImageUrl();
    
    /**
     * 카카오 사용자 정보로 프로필 이미지 설정
     */
    void setKakaoProfileImage(UserVO user, String kakaoProfileImageUrl);

    /**
     * 사용자의 provider 정보 조회
     * @param userId 사용자 ID
     * @return provider 정보 (KAKAO, LOCAL 등)
     */
    String getUserProvider(String userId);
} 