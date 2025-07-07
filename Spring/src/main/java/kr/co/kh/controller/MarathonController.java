
package kr.co.kh.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/marathon")
@Slf4j
public class MarathonController {

    @GetMapping("/search")
    public ResponseEntity<?> searchMarathon(@RequestParam String input) {
        try {

            String serviceKey = "%2BnOCaVW%2B1JSsryrxWSMuqK1a3sTxauT6IW8hPQ%2BtWOJH2HTN6Z7yLuZhe%2B8jljUjMejMViqk64VFryfg4C4oHQ%3D%3D";

            String apiUrl = "https://api.odcloud.kr/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3?page=1&perPage=10&serviceKey=%2BnOCaVW%2B1JSsryrxWSMuqK1a3sTxauT6IW8hPQ%2BtWOJH2HTN6Z7yLuZhe%2B8jljUjMejMViqk64VFryfg4C4oHQ%3D%3D";

//            URI uri = UriComponentsBuilder                //주소를 만들떄 : UriComponentBuilder를 사용
//                    .fromUriString("https://api.odcloud.kr")
//                    .path("/api/15138980/v1/uddi:eedc77c5-a56b-4e77-9c1d-9396fa9cc1d3")
//                    .queryParam("serviceKey", serviceKey)
//                    .queryParam("page", "1")
//                    .queryParam("perPage", "20")
//                    .encode()
//                    .build()
//                    .toUri();
//
//            log.info(apiUrl.toString());

            RestTemplate restTemplate = new RestTemplate();
            String result = restTemplate.getForObject(apiUrl, String.class);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("공공데이터 API 호출 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("API 호출 중 오류 발생");
        }
    }
    }
