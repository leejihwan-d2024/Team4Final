package kr.co.kh.service.impl;

import kr.co.kh.mapper.UserMapper;
import kr.co.kh.service.ProfileImageService;
import kr.co.kh.vo.UserVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class ProfileImageServiceImpl implements ProfileImageService {

    private final UserMapper userMapper;
    private static final String DEFAULT_PROFILE_IMAGE_URL = "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";

    public ProfileImageServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public boolean updateProfileImageUrl(String userId, String imageUrl) {
        try {
            log.info("프로필 이미지 URL 업데이트 시작: userId={}, imageUrl={}", userId, imageUrl);
            
            // URL 유효성 검사
            if (!isValidImageUrl(imageUrl)) {
                log.warn("유효하지 않은 이미지 URL: {}", imageUrl);
                return false;
            }

            // 기존 사용자 정보 조회
            Optional<UserVO> existingUserOpt = userMapper.selectUserById(userId);
            if (existingUserOpt.isEmpty()) {
                log.warn("사용자를 찾을 수 없음: {}", userId);
                return false;
            }

            UserVO user = existingUserOpt.get();
            user.setUserProfileImageUrl(imageUrl);

            // DB 업데이트
            int result = userMapper.updateProfileImageUrl(userId, imageUrl);
            if (result > 0) {
                log.info("프로필 이미지 URL 업데이트 성공: userId={}", userId);
                
                // 업데이트 확인
                Optional<UserVO> updatedUserOpt = userMapper.selectUserById(userId);
                if (updatedUserOpt.isPresent() && imageUrl.equals(updatedUserOpt.get().getUserProfileImageUrl())) {
                    log.info("프로필 이미지 URL 업데이트 검증 성공: userId={}", userId);
                    return true;
                } else {
                    log.warn("프로필 이미지 URL 업데이트 검증 실패: userId={}", userId);
                    return false;
                }
            } else {
                log.warn("프로필 이미지 URL 업데이트 실패: userId={}", userId);
                return false;
            }
        } catch (Exception e) {
            log.error("프로필 이미지 URL 업데이트 중 오류 발생: userId={}", userId, e);
            return false;
        }
    }

    @Override
    public String getProfileImageUrl(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            log.warn("사용자 ID가 null이거나 비어있음");
            return getDefaultProfileImageUrl();
        }

        try {
            // Map으로 반환되는 새로운 방식 사용
            java.util.Map<String, Object> result = userMapper.getProfileImageUrl(userId);
            if (result == null) {
                log.warn("사용자를 찾을 수 없음: userId={}", userId);
                return getDefaultProfileImageUrl();
            }

            String imageUrl = (String) result.get("USER_PROFILE_IMAGE_URL");
            String provider = (String) result.get("PROVIDER");
            
            log.info("프로필 이미지 URL 조회 결과: userId={}, imageUrl={}, provider={}", userId, imageUrl, provider);

            // provider가 KAKAO인 경우 카카오 사용자로 처리
            if ("KAKAO".equals(provider)) {
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    return imageUrl;
                }
                // 카카오 사용자는 기본 이미지 사용
                return getDefaultProfileImageUrl();
            } else {
                // 일반 사용자 (LOCAL)
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    return imageUrl;
                }
                // 일반 사용자도 기본 이미지 사용
                return getDefaultProfileImageUrl();
            }

        } catch (Exception e) {
            log.error("프로필 이미지 URL 조회 실패: userId={}", userId, e);
            return getDefaultProfileImageUrl();
        }
    }

    @Override
    public boolean deleteProfileImageUrl(String userId) {
        try {
            log.info("프로필 이미지 URL 삭제 시작: userId={}", userId);
            
            UserVO user = new UserVO();
            user.setUserId(userId);
            user.setUserProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL);

            int result = userMapper.updateProfileImageUrl(userId, DEFAULT_PROFILE_IMAGE_URL);
            if (result > 0) {
                log.info("프로필 이미지 URL 삭제 성공: userId={}", userId);
                
                // 삭제 확인
                Optional<UserVO> updatedUserOpt = userMapper.selectUserById(userId);
                if (updatedUserOpt.isPresent() && DEFAULT_PROFILE_IMAGE_URL.equals(updatedUserOpt.get().getUserProfileImageUrl())) {
                    log.info("프로필 이미지 URL 삭제 검증 성공: userId={}", userId);
                    return true;
                } else {
                    log.warn("프로필 이미지 URL 삭제 검증 실패: userId={}", userId);
                    return false;
                }
            } else {
                log.warn("프로필 이미지 URL 삭제 실패: userId={}", userId);
                return false;
            }
        } catch (Exception e) {
            log.error("프로필 이미지 URL 삭제 중 오류 발생: userId={}", userId, e);
            return false;
        }
    }

    @Override
    public boolean isValidImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return false;
        }

        String url = imageUrl.trim().toLowerCase();
        
        // 기본적인 URL 패턴 검사
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return false;
        }

        // 일반적인 이미지 호스팅 서비스 허용
        String[] allowedDomains = {
            "picsum.photos",
            "cdn.pixabay.com",
            "images.unsplash.com",
            "imgur.com",
            "i.imgur.com",
            "profile.kakao.com",
            "lh3.googleusercontent.com",
            "graph.facebook.com"
        };

        for (String domain : allowedDomains) {
            if (url.contains(domain)) {
                return true;
            }
        }

        // 파일 확장자 검사 (더 유연하게)
        String[] imageExtensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"};
        for (String ext : imageExtensions) {
            if (url.contains(ext)) {
                return true;
            }
        }

        // URL에 이미지 관련 경로가 있는지 확인
        String[] imagePaths = {"/image", "/img", "/photo", "/avatar", "/profile"};
        for (String path : imagePaths) {
            if (url.contains(path)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public String getDisplayProfileImageUrl(UserVO user) {
        if (user == null) {
            return getDefaultProfileImageUrl();
        }

        // 카카오 사용자인 경우 기존 로직 유지
        if (isKakaoUser(user)) {
            // USER_PROFILE_IMAGE_URL이 있는 경우 우선 사용
            if (user.getUserProfileImageUrl() != null && !user.getUserProfileImageUrl().trim().isEmpty()) {
                return user.getUserProfileImageUrl();
            }

            // 카카오 프로필 이미지가 있는 경우 사용
            if (hasKakaoProfileImage(user)) {
                return user.getKakaoProfileImageUrl();
            }

            // 카카오 기본 이미지 반환
            return getDefaultProfileImageUrl();
        }

        // 일반 사용자인 경우
        if (user.getUserProfileImageUrl() != null && !user.getUserProfileImageUrl().trim().isEmpty()) {
            return user.getUserProfileImageUrl();
        }

        // 일반 사용자의 프로필 이미지가 null이면 카카오 기본 이미지 반환
        return getDefaultProfileImageUrl();
    }

    @Override
    public boolean hasKakaoProfileImage(UserVO user) {
        return isKakaoUser(user) && 
               user.getKakaoProfileImageUrl() != null && 
               !user.getKakaoProfileImageUrl().trim().isEmpty();
    }

    @Override
    public boolean hasProfileImage(UserVO user) {
        if (user == null) return false;
        
        // USER_PROFILE_IMAGE_URL 우선 확인
        if (user.getUserProfileImageUrl() != null && !user.getUserProfileImageUrl().trim().isEmpty()) {
            return true;
        }
        
        // 카카오 프로필 이미지 확인 (fallback)
        return hasKakaoProfileImage(user);
    }

    @Override
    public String getDefaultProfileImageUrl() {
        return "http://img1.kakaocdn.net/thumb/R640x640.q70/?fname=http://t1.kakaocdn.net/account_images/default_profile.jpeg";
    }

    @Override
    public void setKakaoProfileImage(UserVO user, String kakaoProfileImageUrl) {
        if (user == null) return;
        
        user.setKakaoProfileImageUrl(kakaoProfileImageUrl);
        
        // 카카오 프로필 이미지를 USER_PROFILE_IMAGE_URL에도 설정
        if (kakaoProfileImageUrl != null && !kakaoProfileImageUrl.trim().isEmpty()) {
            String currentProfileImage = user.getUserProfileImageUrl();
            if (currentProfileImage == null || currentProfileImage.trim().isEmpty() || 
                currentProfileImage.contains("http://img1.kakaocdn.net/")) {
                user.setUserProfileImageUrl(kakaoProfileImageUrl);
                log.info("카카오 프로필 이미지를 USER_PROFILE_IMAGE_URL에 설정: userId={}, imageUrl={}", user.getUserId(), kakaoProfileImageUrl);
            }
        }
    }

    @Override
    public String getUserProvider(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return null;
        }
        
        try {
            UserVO user = userMapper.selectUserById(userId).orElse(null);
            if (user != null) {
                return user.getProvider();
            }
        } catch (Exception e) {
            log.error("사용자 provider 조회 실패: userId={}", userId, e);
        }
        
        return null;
    }

    /**
     * 카카오 사용자인지 확인
     */
    private boolean isKakaoUser(UserVO user) {
        return "KAKAO".equals(user.getProvider()) || 
               (user.getUserId() != null && user.getUserId().startsWith("kakao_"));
    }
} 