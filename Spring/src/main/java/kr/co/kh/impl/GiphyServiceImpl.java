package kr.co.kh.impl;

import kr.co.kh.service.GiphyService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class GiphyServiceImpl implements GiphyService {

    @Value("${giphy.api.key:ErmmZ2riyWkDwSkRT2z4BlNK8AmtJTDu}")
    private String giphyApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GIPHY_RANDOM_URL = "https://api.giphy.com/v1/gifs/random";
    
    // Rate limiting을 위한 마지막 요청 시간 추적
    private final AtomicLong lastRequestTime = new AtomicLong(0);
    private static final long MIN_REQUEST_INTERVAL = 1000; // 1초 간격


    
    @Override
    public Map<String, Object> getMixedRandomGifs() {
        try {
            // 사용자 URL 배열 (나중에 실제 URL로 교체)
            String[] userUrls = {
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bHdzOHV6czY1Zmx6ZWp1d3dkaGY0bHZxZWI1dGNhNmxpMjVxcWRudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/9NnCfXjsJrF2MaMrlQ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cHY2NnNhaXhjN3hicHp1OWJzaGxkcXN0dHIzYzNzOW15M3JtdGJ1MiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l49FqI6uiN9NmKpBm/giphy.gif", 
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGZnZzBqaWpocmd0emRteTc0ZTdoNzBqdnNlMXFvMWc5czZ0a3hqcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/42DjBVzGGdMvwDTNuW/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aHpvbHdpZGwwMWJyejR6Z3lvbXRhdmV4ZTk5cDkyMWR3ejUyMmRqcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/THD7thMQZoOYoyZ3EK/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWVuczk1ZnV6ZnB1MHBsYmh4Y2Y3N2djMDFrdHhwb2t3YjY4c2M1YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fI0J5XpnFIyEnyzMbJ/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExem56c2loam53cmRpcjZzZnZpY2pxc2pqZGt3c255M2t2YnplaWszeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QKUTD5lAgpgrSHpbMB/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTVicXNjMXZ0cnF4YjAzMWwyejc3cWNiODZhbWEyaWFzamxmMjJkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1vY8RboCYg4wM/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdrNjg2Z3JubjI2amZtbHJiZ2xyNm95M2J3czJyNGg4ZXBpdnhteiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ajr9uGacELT0s/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZvaDJucGZhcnowN2RmOXZnYjhhdWwxaTNidWlteDRqdnU5N3BvdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2URR3LX92KHiE0/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnhic2p0a3pqYmN6ZnhtcDcxZGMxMGM3YWZkbDA5MDFvNnBydGR3biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYxWYPZftqFkDks/giphy.gif"
            };
            
            // 다양한 러닝 관련 검색어 배열
            String[] runningTags = {
                "running", "jogging", "sprint"
            };
            
            List<Map<String, Object>> mixedGifList = new ArrayList<>();
            
            // 총 4개 GIF 생성 (Giphy 2개 + URL 2개)
            for (int i = 0; i < 4; i++) {
                if (i % 2 == 0) {
                    // 짝수 인덱스: Giphy API 호출
                    // Rate limiting 체크
                    long currentTime = System.currentTimeMillis();
                    long lastRequest = lastRequestTime.get();
                    long timeSinceLastRequest = currentTime - lastRequest;
                    
                    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
                        long waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
                        Thread.sleep(waitTime);
                    }
                    
                    // 마지막 요청 시간 업데이트
                    lastRequestTime.set(System.currentTimeMillis());
                    
                    // 랜덤하게 검색어 선택
                    String randomTag = runningTags[(int) (Math.random() * runningTags.length)];
                    
                    // Giphy API 호출을 위한 URL 구성
                    String url = String.format("%s?api_key=%s&tag=%s&rating=g", 
                        GIPHY_RANDOM_URL, giphyApiKey, randomTag);

                    // HTTP 헤더 설정
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    HttpEntity<String> entity = new HttpEntity<>(headers);

                    // API 호출
                    ResponseEntity<Map> response = restTemplate.exchange(
                        url, 
                        HttpMethod.GET, 
                        entity, 
                        Map.class
                    );

                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map<String, Object> gifData = response.getBody();
                        gifData.put("usedTag", randomTag);
                        gifData.put("source", "giphy");
                        gifData.put("order", i + 1);
                        mixedGifList.add(gifData);
                    } else if (response.getStatusCodeValue() == 429) {
                        // 429 에러 시 사용자 URL로 대체
                        String randomUserUrl = userUrls[(int) (Math.random() * userUrls.length)];
                        
                        Map<String, Object> userGifData = new HashMap<>();
                        userGifData.put("data", new HashMap<String, Object>() {{
                            put("images", new HashMap<String, Object>() {{
                                put("original", new HashMap<String, Object>() {{
                                    put("url", randomUserUrl);
                                }});
                            }});
                        }});
                        userGifData.put("source", "user_url_fallback");
                        userGifData.put("order", i + 1);
                        userGifData.put("fallback_reason", "429_rate_limit");
                        mixedGifList.add(userGifData);
                    }
                } else {
                    // 홀수 인덱스: 사용자 URL에서 랜덤 선택
                    String randomUserUrl = userUrls[(int) (Math.random() * userUrls.length)];
                    
                    Map<String, Object> userGifData = new HashMap<>();
                    userGifData.put("data", new HashMap<String, Object>() {{
                        put("images", new HashMap<String, Object>() {{
                            put("original", new HashMap<String, Object>() {{
                                put("url", randomUserUrl);
                            }});
                        }});
                    }});
                    userGifData.put("source", "user_url");
                    userGifData.put("order", i + 1);
                    mixedGifList.add(userGifData);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("data", mixedGifList);
            result.put("count", mixedGifList.size());
            result.put("success", true);
            result.put("pattern", "Giphy-URL-Giphy-URL");
            
            return result;
            
        } catch (InterruptedException e) {
            // Rate limiting 대기 중 인터럽트
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "요청이 중단되었습니다");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            return errorResponse;
        } catch (Exception e) {
            // 예외 처리 - 429 에러나 기타 오류 시 사용자 URL만 반환
            try {
                // 사용자 URL 배열
                String[] userUrls = {
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bHdzOHV6czY1Zmx6ZWp1d3dkaGY0bHZxZWI1dGNhNmxpMjVxcWRudyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/9NnCfXjsJrF2MaMrlQ/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cHY2NnNhaXhjN3hicHp1OWJzaGxkcXN0dHIzYzNzOW15M3JtdGJ1MiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l49FqI6uiN9NmKpBm/giphy.gif", 
                "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGZnZzBqaWpocmd0emRteTc0ZTdoNzBqdnNlMXFvMWc5czZ0a3hqcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/42DjBVzGGdMvwDTNuW/giphy.gif",
                "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3aHpvbHdpZGwwMWJyejR6Z3lvbXRhdmV4ZTk5cDkyMWR3ejUyMmRqcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/THD7thMQZoOYoyZ3EK/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWVuczk1ZnV6ZnB1MHBsYmh4Y2Y3N2djMDFrdHhwb2t3YjY4c2M1YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fI0J5XpnFIyEnyzMbJ/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExem56c2loam53cmRpcjZzZnZpY2pxc2pqZGt3c255M2t2YnplaWszeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QKUTD5lAgpgrSHpbMB/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTVicXNjMXZ0cnF4YjAzMWwyejc3cWNiODZhbWEyaWFzamxmMjJkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1vY8RboCYg4wM/giphy.gif",
                "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWdrNjg2Z3JubjI2amZtbHJiZ2xyNm95M2J3czJyNGg4ZXBpdnhteiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ajr9uGacELT0s/giphy.gif",
                "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZvaDJucGZhcnowN2RmOXZnYjhhdWwxaTNidWlteDRqdnU5N3BvdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2URR3LX92KHiE0/giphy.gif",
                "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnhic2p0a3pqYmN6ZnhtcDcxZGMxMGM3YWZkbDA5MDFvNnBydGR3biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYxWYPZftqFkDks/giphy.gif"
                };
                
                List<Map<String, Object>> fallbackGifList = new ArrayList<>();
                
                // 4개의 사용자 URL만 반환
                for (int i = 0; i < 4; i++) {
                    String randomUserUrl = userUrls[(int) (Math.random() * userUrls.length)];
                    
                    Map<String, Object> userGifData = new HashMap<>();
                    userGifData.put("data", new HashMap<String, Object>() {{
                        put("images", new HashMap<String, Object>() {{
                            put("original", new HashMap<String, Object>() {{
                                put("url", randomUserUrl);
                            }});
                        }});
                    }});
                    userGifData.put("source", "user_url_fallback");
                    userGifData.put("order", i + 1);
                    userGifData.put("fallback_reason", "api_error");
                    fallbackGifList.add(userGifData);
                }
                
                Map<String, Object> fallbackResult = new HashMap<>();
                fallbackResult.put("data", fallbackGifList);
                fallbackResult.put("count", fallbackGifList.size());
                fallbackResult.put("success", true);
                fallbackResult.put("pattern", "User-URL-Only (API Error)");
                fallbackResult.put("warning", "Giphy API 오류로 사용자 URL만 표시됩니다: " + e.getMessage());
                
                return fallbackResult;
                
            } catch (Exception fallbackError) {
                // 최종 에러 응답
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Giphy API 오류 및 대체 URL 로드 실패");
                errorResponse.put("message", e.getMessage());
                errorResponse.put("success", false);
                return errorResponse;
            }
        }
    }
} 