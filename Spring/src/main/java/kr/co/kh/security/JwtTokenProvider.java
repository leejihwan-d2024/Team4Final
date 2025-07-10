package kr.co.kh.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import kr.co.kh.model.CustomUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final String jwtSecret;
    private final long jwtExpirationInMs;

    public JwtTokenProvider(@Value("${app.jwt.secret}") String jwtSecret, @Value("${app.jwt.expiration}") long jwtExpirationInMs) {
        this.jwtSecret = jwtSecret;
        this.jwtExpirationInMs = jwtExpirationInMs;
    }

    /**
     * token 생성
     * @param customUserDetails
     * @return
     */
    public String generateToken(CustomUserDetails customUserDetails) {
        Instant expiryDate = Instant.now().plusMillis(jwtExpirationInMs);
        return Jwts.builder()
                .setSubject(customUserDetails.getUserId())
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(expiryDate))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    /**
     * userid로 token 생성
     * @param userId
     * @return
     */
    public String generateTokenFromUserId(String userId) {
        Instant expiryDate = Instant.now().plusMillis(jwtExpirationInMs);
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(Date.from(Instant.now()))
                .setExpiration(Date.from(expiryDate))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    /**
     * 토큰 내에 캡슐화 된 사용자 ID를 반환
     * @param token
     * @return
     */
    public String getUserIdFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * 토큰 내에 캡슐화 된 토큰 만료 날짜를 반환
     * @param token
     * @return
     */
    public Date getTokenExpiryFromJWT(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();

        return claims.getExpiration();
    }

    /**
     * 새로 고침 토큰 논리를 적절하게 실행할 수 있도록 클라이언트에 대한 jwt 만료를 반환
     * @return
     */
    public long getExpiryDuration() {
        return jwtExpirationInMs;
    }
}
