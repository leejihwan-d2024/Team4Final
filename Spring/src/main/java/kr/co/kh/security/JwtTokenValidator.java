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
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);

        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
            throw new InvalidTokenRequestException("JWT", authToken, "Incorrect signature");

        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, "Malformed jwt token");

        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, "Token expired. Refresh required");

        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
            throw new InvalidTokenRequestException("JWT", authToken, "Unsupported JWT token");

        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty.");
            throw new InvalidTokenRequestException("JWT", authToken, "Illegal argument token");
        }
        validateTokenIsNotForALoggedOutDevice(authToken);
        return true;
    }

    private void validateTokenIsNotForALoggedOutDevice(String authToken) {
        OnUserLogoutSuccessEvent previouslyLoggedOutEvent = loggedOutTokenCache.getLogoutEventForToken(authToken);
        if (previouslyLoggedOutEvent != null) {
            String userEmail = previouslyLoggedOutEvent.getUserEmail();
            Date logoutEventDate = previouslyLoggedOutEvent.getEventTime();
            String errorMessage = String.format("Token corresponds to an already logged out user [%s] at [%s]. Please login again", userEmail, logoutEventDate);
            throw new InvalidTokenRequestException("JWT", authToken, errorMessage);
        }
    }
}
