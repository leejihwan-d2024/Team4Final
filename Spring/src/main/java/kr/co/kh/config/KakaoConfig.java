package kr.co.kh.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kakao")
@Getter
@Setter
public class KakaoConfig {
    
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String appKey;
    private String adminKey;
    
    // 카카오 API URL들
    public static final String KAKAO_AUTH_URL = "https://kauth.kakao.com";
    public static final String KAKAO_API_URL = "https://kapi.kakao.com";
    
    // 토큰 검증 URL
    public String getTokenInfoUrl() {
        return KAKAO_API_URL + "/v1/user/access_token_info";
    }
    
    // 사용자 정보 조회 URL
    public String getUserInfoUrl() {
        return KAKAO_API_URL + "/v2/user/me";
    }
    
    // 로그아웃 URL
    public String getLogoutUrl() {
        return KAKAO_API_URL + "/v1/user/logout";
    }
} 