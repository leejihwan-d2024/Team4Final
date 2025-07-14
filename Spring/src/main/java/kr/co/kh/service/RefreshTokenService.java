package kr.co.kh.service;

import kr.co.kh.exception.TokenRefreshException;
import kr.co.kh.model.token.RefreshToken;
import kr.co.kh.repository.RefreshTokenRepository;
import kr.co.kh.util.Util;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.token.refresh.duration}")
    private Long refreshTokenDurationMs;

    @Autowired
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    public RefreshToken save(RefreshToken refreshToken) {
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken createRefreshToken() {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        refreshToken.setToken(Util.generateRandomUuid());
        refreshToken.setRefreshCount(0L);
        
        log.info("=== Refresh Token 생성 ===");
        log.info("토큰 ID: {}", refreshToken.getId());
        log.info("토큰 값: {}", refreshToken.getToken());
        log.info("만료 시간: {}", refreshToken.getExpiryDate());
        log.info("리프레시 카운트: {}", refreshToken.getRefreshCount());
        log.info("================================");
        
        return refreshToken;
    }

    public void verifyExpiration(RefreshToken token) {
        log.info("=== Refresh Token 만료 검증 ===");
        log.info("토큰 ID: {}", token.getId());
        log.info("토큰 값: {}", token.getToken());
        log.info("만료 시간: {}", token.getExpiryDate());
        log.info("현재 시간: {}", Instant.now());
        
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            log.error("=== Refresh Token 만료됨 ===");
            log.error("토큰 ID: {}", token.getId());
            log.error("토큰 값: {}", token.getToken());
            log.error("만료 시간: {}", token.getExpiryDate());
            log.error("================================");
            throw new TokenRefreshException(token.getToken(), "Expired token. Please issue a new request");
        }
        
        log.info("=== Refresh Token 유효함 ===");
        log.info("================================");
    }

    public void deleteById(Long id) {
        log.info("=== Refresh Token 삭제 ===");
        log.info("삭제할 토큰 ID: {}", id);
        log.info("================================");
        refreshTokenRepository.deleteById(id);
    }

    public void increaseCount(RefreshToken refreshToken) {
        log.info("=== Refresh Token 사용 카운트 증가 ===");
        log.info("토큰 ID: {}", refreshToken.getId());
        log.info("이전 카운트: {}", refreshToken.getRefreshCount());
        
        refreshToken.incrementRefreshCount();
        save(refreshToken);
        
        log.info("증가된 카운트: {}", refreshToken.getRefreshCount());
        log.info("================================");
    }
}
