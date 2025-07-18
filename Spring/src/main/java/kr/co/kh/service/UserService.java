package kr.co.kh.service;

import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.exception.UserLogoutException;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.UserDevice;
import kr.co.kh.model.payload.request.LogOutRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
}
