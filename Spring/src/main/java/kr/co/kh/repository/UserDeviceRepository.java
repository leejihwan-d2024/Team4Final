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

    Optional<UserDevice> findByUserId(String userId);

    List<UserDevice> findAllByUserId(String userId);

    Optional<UserDevice> findByUserIdAndDeviceId(String userId, String deviceId);
    
    Optional<UserDevice> findByDeviceId(String deviceId);
}
