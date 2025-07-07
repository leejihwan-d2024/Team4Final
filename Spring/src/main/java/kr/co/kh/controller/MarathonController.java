
package kr.co.kh.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/marathon")
@Slf4j
public class MarathonController {

    @GetMapping("/search")
    public ResponseEntity<?> searchMarathon(@RequestParam String input) {
        try {
            RestTemplate restTemplate = new RestTemplate();



            String serviceKey = "+nOCaVW+1JSsryrxWSMuqK1a3sTxauT6IW8hPQ+tWOJH2HTN6Z7yLuZhe+8jljUjMejMViqk64VFryfg4C4oHQ==";


            String apiUrl = "https://api.odcloud.kr/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3"
                    + "?serviceKey=" + serviceKey
                    + "&page=1&perPage=20";


            String result = restTemplate.getForObject(apiUrl, String.class);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("공공데이터 API 호출 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("API 호출 중 오류 발생");
        }
    }
    }
