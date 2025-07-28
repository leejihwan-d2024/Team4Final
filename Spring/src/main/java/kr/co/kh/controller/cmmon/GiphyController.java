package kr.co.kh.controller.cmmon;

import kr.co.kh.service.GiphyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/giphy")
public class GiphyController {

    @Autowired
    private GiphyService giphyService;

    /**
     * Giphy API와 사용자 URL을 번갈아가며 랜덤 GIF를 가져오는 API 엔드포인트
     * 총 4개 출력 (Giphy 2개 + URL 2개)
     * @return 혼합 GIF 데이터
     */
    @GetMapping("/mixed-random")
    public ResponseEntity<Map<String, Object>> getMixedRandomGifs() {
        try {
            Map<String, Object> gifData = giphyService.getMixedRandomGifs();
            
            // 에러가 있는지 확인
            if (gifData.containsKey("error")) {
                return ResponseEntity.badRequest().body(gifData);
            }
            
            return ResponseEntity.ok(gifData);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "error", "서버 오류",
                "message", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 