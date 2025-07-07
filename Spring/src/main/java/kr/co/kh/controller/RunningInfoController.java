package kr.co.kh.controller;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;


@RestController
@RequestMapping("/api/info")
@Slf4j
public class RunningInfoController {
    private final String REST_API_KEY = "e570be3a37d8b1bba10c351eddbb245b";


    @GetMapping("/search")
    public ResponseEntity<?> searchBlogs(@RequestParam String query) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + REST_API_KEY); // 공백 주의!

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String kakaoUrl = "https://dapi.kakao.com/v2/search/blog?query=" + URLEncoder.encode(query, "UTF-8");
            ResponseEntity<String> response = restTemplate.exchange(kakaoUrl, HttpMethod.GET, entity, String.class);

            return ResponseEntity.ok(response.getBody());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("카카오 API 호출 실패");
        }
    }
}
