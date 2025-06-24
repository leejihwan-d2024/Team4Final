package kr.co.kh.cache;

import kr.co.kh.event.OnUserLogoutSuccessEvent;
import kr.co.kh.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import net.jodah.expiringmap.ExpiringMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * 토큰 정보 무효화
 * JWT 토큰은 변경 불가능하므로 토큰이 만료되지 않는 한 로그 아웃 후에도 계속 액세스 할 수 있다.
 * <p>
 * 이 캐시가 무기한 쌓이는 것을 방지하기 위해 최대 크기를 설정함
 * 각 토큰의 TTL은 만료 될 때까지 남아있는 시간 (초)입니다. 이는 JWT 토큰이 만료되면 어쨌든 사용할 수 없으므로 최적화로 수행됨
 */
@Component
@Slf4j
public class LoggedOutJwtTokenCache {

    private final ExpiringMap<String, OnUserLogoutSuccessEvent> tokenEventMap;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public LoggedOutJwtTokenCache(@Value("${app.cache.logoutToken.maxSize}") int maxSize, JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.tokenEventMap = ExpiringMap.builder()
                .variableExpiration()
                .maxSize(maxSize)
                .build();
    }

    public void markLogoutEventForToken(OnUserLogoutSuccessEvent event) {
        String token = event.getToken();
        if (tokenEventMap.containsKey(token)) {
            log.info("Log out token for user [{}] is already present in the cache", event.getUserEmail());

        } else {
            Date tokenExpiryDate = tokenProvider.getTokenExpiryFromJWT(token);
            long ttlForToken = getTTLForToken(tokenExpiryDate);
            log.info("Logout token cache set for [{}] with a TTL of [{}] seconds. Token is due expiry at [{}]", event.getUserEmail(), ttlForToken, tokenExpiryDate);
            tokenEventMap.put(token, event, ttlForToken, TimeUnit.SECONDS);
        }
    }

    public OnUserLogoutSuccessEvent getLogoutEventForToken(String token) {
        return tokenEventMap.get(token);
    }

    private long getTTLForToken(Date date) {
        long secondAtExpiry = date.toInstant().getEpochSecond();
        long secondAtLogout = Instant.now().getEpochSecond();
        return Math.max(0, secondAtExpiry - secondAtLogout);
    }
}
