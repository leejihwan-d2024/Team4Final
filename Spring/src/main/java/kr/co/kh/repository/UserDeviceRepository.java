package kr.co.kh.repository;

import kr.co.kh.model.UserDevice;
import kr.co.kh.model.token.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {

    @Override
    Optional<UserDevice> findById(Long id);

    Optional<UserDevice> findByRefreshToken(RefreshToken refreshToken);

    Optional<UserDevice> findByUserId(Long userId);

    List<UserDevice> findAllByUserId(Long userId);

    Optional<UserDevice> findByUserIdAndDeviceId(Long userId, String deviceId);
}
