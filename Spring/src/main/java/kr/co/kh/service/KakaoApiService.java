package kr.co.kh.service;

import kr.co.kh.config.KakaoConfig;
import kr.co.kh.model.payload.KakaoUserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class KakaoApiService {

    private final KakaoConfig kakaoConfig;
    private final RestTemplate restTemplate;

    /**
     * 카카오 액세스 토큰 검증
     * @param accessToken
     * @return
     */
    public boolean validateToken(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                kakaoConfig.getTokenInfoUrl(),
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            log.info("카카오 토큰 검증 성공: {}", response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            log.error("카카오 토큰 검증 실패: {}", e.getMessage());
            return false;
        }
    }

    /**
     * 카카오 사용자 정보 조회
     * @param accessToken
     * @return
     */
    public KakaoUserInfo getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                kakaoConfig.getUserInfoUrl(),
                HttpMethod.GET,
                entity,
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> userData = response.getBody();
                
                KakaoUserInfo userInfo = new KakaoUserInfo();
                userInfo.setId(String.valueOf(userData.get("id")));
                
                // 카카오 계정 정보
                Map<String, Object> kakaoAccount = (Map<String, Object>) userData.get("kakao_account");
                if (kakaoAccount != null) {
                    userInfo.setEmail((String) kakaoAccount.get("email"));
                }
                
                // 프로필 정보
                Map<String, Object> properties = (Map<String, Object>) userData.get("properties");
                if (properties != null) {
                    userInfo.setNickname((String) properties.get("nickname"));
                    userInfo.setProfileImage((String) properties.get("profile_image"));
                }
                
                log.info("카카오 사용자 정보 조회 성공: {}", userInfo.getId());
                return userInfo;
            }
            
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 실패: {}", e.getMessage());
        }
        
        return null;
    }

    /**
     * 카카오 로그아웃
     * @param accessToken
     * @return
     */
    public boolean logout(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                kakaoConfig.getLogoutUrl(),
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            log.info("카카오 로그아웃 성공: {}", response.getStatusCode());
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            log.error("카카오 로그아웃 실패: {}", e.getMessage());
            return false;
        }
    }
} 