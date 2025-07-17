package kr.co.kh.security;

import io.jsonwebtoken.*;
import kr.co.kh.cache.LoggedOutJwtTokenCache;
import kr.co.kh.event.OnUserLogoutSuccessEvent;
import kr.co.kh.exception.InvalidTokenRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@Slf4j
public class JwtTokenValidator {

    private final String jwtSecret;
    private final LoggedOutJwtTokenCache loggedOutTokenCache;

    @Autowired
    public JwtTokenValidator(@Value("${app.jwt.secret}") String jwtSecret, LoggedOutJwtTokenCache loggedOutTokenCache) {
        this.jwtSecret = jwtSecret;
        this.loggedOutTokenCache = loggedOutTokenCache;
    }

    /**
     * 토큰이 다음 속성을 충족하는지 확인
     * - 서명이 잘못되지 않았는지
     * - 토큰이 만료되지 않았는지
     * - 지원 되는 토큰인지
     * - 토큰이 최근에 로그아웃 되지 않았는지
     */
    public boolean validateToken(String authToken) {
        log.info("=== JWT 토큰 유효성 검증 시작 ===");
        log.info("토큰 길이: {} characters", authToken.length());
        
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            log.info("JWT 토큰 파싱 성공");

        } catch (SignatureException ex) {
            log.error("=== JWT 서명 검증 실패 ===");
            log.error("오류: {}", ex.getMessage());
            log.error("================================");
            throw new InvalidTokenRequestException("JWT", authToken, "Incorrect signature");

        } catch (MalformedJwtException ex) {
            log.error("=== JWT 토큰 형식 오류 ===");
            log.error("오류: {}", ex.getMessage());
            log.error("================================");
            throw new InvalidTokenRequestException("JWT", authToken, "Malformed jwt token");

        } catch (ExpiredJwtException ex) {
            log.error("=== JWT 토큰 만료됨 ===");
            log.error("만료 시간: {}", ex.getClaims().getExpiration());
            log.error("현재 시간: {}", new Date());
            log.error("================================");
            throw new InvalidTokenRequestException("JWT", authToken, "Token expired. Refresh required");

        } catch (UnsupportedJwtException ex) {
            log.error("=== 지원되지 않는 JWT 토큰 ===");
            log.error("오류: {}", ex.getMessage());
            log.error("================================");
            throw new InvalidTokenRequestException("JWT", authToken, "Unsupported JWT token");

        } catch (IllegalArgumentException ex) {
            log.error("=== JWT 클레임 문자열이 비어있음 ===");
            log.error("오류: {}", ex.getMessage());
            log.error("================================");
            throw new InvalidTokenRequestException("JWT", authToken, "Illegal argument token");
        }
        
        log.info("JWT 토큰 기본 검증 완료");
        validateTokenIsNotForALoggedOutDevice(authToken);
        log.info("=== JWT 토큰 유효성 검증 완료 ===");
        log.info("================================");
        return true;
    }

    private void validateTokenIsNotForALoggedOutDevice(String authToken) {
        log.info("=== 로그아웃된 토큰 검증 ===");
        OnUserLogoutSuccessEvent previouslyLoggedOutEvent = loggedOutTokenCache.getLogoutEventForToken(authToken);
        if (previouslyLoggedOutEvent != null) {
            String userEmail = previouslyLoggedOutEvent.getUserEmail();
            Date logoutEventDate = previouslyLoggedOutEvent.getEventTime();
            
            log.error("=== 이미 로그아웃된 토큰 발견 ===");
            log.error("사용자 이메일: {}", userEmail);
            log.error("로그아웃 시간: {}", logoutEventDate);
            log.error("================================");
            
            String errorMessage = String.format("Token corresponds to an already logged out user [%s] at [%s]. Please login again", userEmail, logoutEventDate);
            throw new InvalidTokenRequestException("JWT", authToken, errorMessage);
        }
        log.info("토큰이 로그아웃되지 않았습니다.");
        log.info("================================");
    }
}
