package kr.co.kh.service;

import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.exception.UserLogoutException;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.UserDevice;
import kr.co.kh.model.payload.request.LogOutRequest;
import kr.co.kh.model.enums.UserType;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class UserService {

    private final UserDeviceService userDeviceService;
    private final RefreshTokenService refreshTokenService;

    /**
     * 로그 아웃
     * @param currentUser
     * @param logOutRequest
     */
    public void logoutUser(@CurrentUser CustomUserDetails currentUser, LogOutRequest logOutRequest) {
        String deviceId = logOutRequest.getDeviceInfo().getDeviceId();
        log.info(deviceId);
        log.info(currentUser.toString());
        UserDevice userDevice = userDeviceService.findByUserIdAndDeviceId(currentUser.getUserId(), deviceId)
                .filter(device -> device.getDeviceId().equals(deviceId))
                .orElseThrow(() -> new UserLogoutException(logOutRequest.getDeviceInfo().getDeviceId(), "해당정보가 없습니다."));

        log.info("Removing refresh token associated with device [{}]", userDevice);
        refreshTokenService.deleteById(userDevice.getRefreshToken().getId());
    }

    /**
     * 사용자 등록
     */
    public void registerUser(UserVO userVO) {
        // Implementation needed
    }

    /**
     * 사용자 ID로 사용자 조회
     */
    public Optional<UserVO> getUserById(String userId) {
        // Implementation needed
        return Optional.empty();
    }

    /**
     * 이메일로 사용자 조회
     */
    public Optional<UserVO> getUserByEmail(String userEmail) {
        // Implementation needed
        return Optional.empty();
    }

    /**
     * 사용자 정보 업데이트
     */
    public void updateUser(UserVO userVO) {
        // Implementation needed
    }

    /**
     * 사용자 삭제
     */
    public void deleteUser(String userId) {
        // Implementation needed
    }

    /**
     * 사용자 ID 중복 확인
     */
    public boolean existsByUserId(String userId) {
        // Implementation needed
        return false;
    }

    /**
     * 이메일 중복 확인
     */
    public boolean existsByUserEmail(String userEmail) {
        // Implementation needed
        return false;
    }

    /**
     * 카카오 사용자인지 확인
     */
    public boolean isKakaoUser(UserVO user) {
        // Implementation needed
        return false;
    }

    /**
     * 일반 사용자인지 확인
     */
    public boolean isLocalUser(UserVO user) {
        // Implementation needed
        return false;
    }

    /**
     * 사용자 타입 반환
     */
    public UserType getUserType(UserVO user) {
        // Implementation needed
        return null;
    }

    /**
     * 사용자 타입을 문자열로 반환
     */
    public String getUserTypeDisplayName(UserVO user) {
        // Implementation needed
        return null;
    }

    /**
     * 로그인 방식 표시명 반환
     */
    public String getLoginMethodDisplay(UserVO user) {
        // Implementation needed
        return null;
    }

    /**
     * 사용자 정보 요약 문자열 반환
     */
    public String getUserInfoSummary(UserVO user) {
        // Implementation needed
        return null;
    }
}
