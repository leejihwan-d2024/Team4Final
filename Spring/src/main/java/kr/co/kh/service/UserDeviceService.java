package kr.co.kh.service;

import kr.co.kh.exception.TokenRefreshException;
import kr.co.kh.model.UserDevice;
import kr.co.kh.model.payload.DeviceInfo;
import kr.co.kh.model.token.RefreshToken;
import kr.co.kh.repository.UserDeviceRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class UserDeviceService {

    private final UserDeviceRepository userDeviceRepository;
    private final RefreshTokenService refreshTokenService;

    /**
     * 사용자 id로 디바이스 찾기
     * @param userId
     * @return
     */
    public Optional<UserDevice> findByUserId(Long userId) {
        return userDeviceRepository.findByUserId(userId);
    }

    /**
     * 사용자 ID, 장치 ID로 찾기
     * @param userId
     * @param deviceId
     * @return
     */
    public Optional<UserDevice> findByUserIdAndDeviceId(Long userId, String deviceId) {
        return userDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
    }

    public Optional<UserDevice> findByUserIDAndDeviceId(Long userId, String deviceId) {
        Optional<UserDevice> result = userDeviceRepository.findByUserIdAndDeviceId(userId, deviceId);
        if (result.isPresent()) {
            refreshTokenService.increaseCount(result.get().getRefreshToken());
            return result;
        } else {
            return Optional.empty();
        }
    }

    public List<UserDevice> findAllByUserId(Long userId) {
        return userDeviceRepository.findAllByUserId(userId);
    }

    /**
     * refresh token으로 디바이스 찾기
     * @param refreshToken
     * @return
     */
    public Optional<UserDevice> findByRefreshToken(RefreshToken refreshToken) {
        return userDeviceRepository.findByRefreshToken(refreshToken);
    }

    /**
     * 새 사용자 디바이스를 만들고 사용자를 현재 장치로 설정
     * @param deviceInfo
     * @return
     */
    public UserDevice createUserDevice(DeviceInfo deviceInfo) {
        UserDevice userDevice = new UserDevice();
        userDevice.setDeviceId(deviceInfo.getDeviceId());
        userDevice.setDeviceType(deviceInfo.getDeviceType());
        userDevice.setNotificationToken(deviceInfo.getNotificationToken());
        userDevice.setRefreshActive(true);
        return userDevice;
    }

    /**
     * 토큰에 해당하는 사용자 장치에 새로 고침이 활성화되어 있는지 확인하고 클라이언트에 적절한 오류를 발생시킴
     * @param refreshToken
     */
    void verifyRefreshAvailability(RefreshToken refreshToken) {
        UserDevice userDevice = findByRefreshToken(refreshToken)
                .orElseThrow(() -> new TokenRefreshException(refreshToken.getToken(), "No device found for the matching token. Please login again"));

        if (!userDevice.getRefreshActive()) {
            throw new TokenRefreshException(refreshToken.getToken(), "Refresh blocked for the device. Please login through a different device");
        }
    }

    public void save(UserDevice userDevice) {
        userDeviceRepository.save(userDevice);
    }
}
