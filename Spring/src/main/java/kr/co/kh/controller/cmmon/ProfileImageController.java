package kr.co.kh.controller.cmmon;

import kr.co.kh.service.ProfileImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@Slf4j
public class ProfileImageController {

    private final ProfileImageService profileImageService;

    public ProfileImageController(ProfileImageService profileImageService) {
        this.profileImageService = profileImageService;
    }

    /**
     * 프로필 이미지 URL 업데이트 (PUT 메서드 - RESTful)
     * @param userId 사용자 ID
     * @param requestBody 요청 본문 (imageUrl 포함)
     * @return 업데이트 결과
     */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfileImageUrl(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        
        String imageUrl = requestBody.get("imageUrl");
        
        log.info("=== 프로필 이미지 URL 업데이트 요청 (PUT) ===");
        log.info("사용자 ID: {}", userId);
        log.info("이미지 URL: {}", imageUrl);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 프로필 이미지 URL 업데이트
            boolean success = profileImageService.updateProfileImageUrl(userId, imageUrl);
            
            if (success) {
                response.put("success", true);
                response.put("message", "프로필 이미지 URL이 성공적으로 업데이트되었습니다.");
                response.put("imageUrl", imageUrl);
                
                log.info("=== 프로필 이미지 URL 업데이트 성공 ===");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "유효하지 않은 이미지 URL입니다.");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("프로필 이미지 URL 업데이트 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "이미지 URL 업데이트 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 프로필 이미지 URL 업데이트 (POST 메서드 - 기존 호환성)
     * @param imageUrl 이미지 URL
     * @param userId 사용자 ID
     * @return 업데이트 결과
     */
    @PostMapping("/update-url")
    public ResponseEntity<Map<String, Object>> updateProfileImageUrlPost(
            @RequestParam("imageUrl") String imageUrl,
            @RequestParam("userId") String userId) {
        
        log.info("=== 프로필 이미지 URL 업데이트 요청 (POST) ===");
        log.info("사용자 ID: {}", userId);
        log.info("이미지 URL: {}", imageUrl);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 프로필 이미지 URL 업데이트
            boolean success = profileImageService.updateProfileImageUrl(userId, imageUrl);
            
            if (success) {
                response.put("success", true);
                response.put("message", "프로필 이미지 URL이 성공적으로 업데이트되었습니다.");
                response.put("imageUrl", imageUrl);
                
                log.info("=== 프로필 이미지 URL 업데이트 성공 ===");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "유효하지 않은 이미지 URL입니다.");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("프로필 이미지 URL 업데이트 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "이미지 URL 업데이트 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 프로필 이미지 URL 조회
     * @param userId 사용자 ID
     * @return 프로필 이미지 URL
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getProfileImageUrl(@PathVariable String userId) {
        
        log.info("=== 프로필 이미지 URL 조회 ===");
        log.info("사용자 ID: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String imageUrl = profileImageService.getProfileImageUrl(userId);
            
            response.put("success", true);
            response.put("imageUrl", imageUrl);
            
            // provider 정보도 함께 반환
            String provider = profileImageService.getUserProvider(userId);
            if (provider != null) {
                response.put("provider", provider);
                log.info("사용자 provider: {}", provider);
            }
            
            log.info("=== 프로필 이미지 URL 조회 성공 ===");
            log.info("이미지 URL: {}", imageUrl);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("프로필 이미지 URL 조회 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "이미지 URL 조회 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 프로필 이미지 URL 삭제 (기본값으로 설정)
     * @param userId 사용자 ID
     * @return 삭제 결과
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteProfileImageUrl(@PathVariable String userId) {
        
        log.info("=== 프로필 이미지 URL 삭제 요청 ===");
        log.info("사용자 ID: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 프로필 이미지 URL을 기본값으로 설정
            boolean success = profileImageService.deleteProfileImageUrl(userId);
            
            if (success) {
                response.put("success", true);
                response.put("message", "프로필 이미지가 기본 이미지로 설정되었습니다.");
                
                log.info("=== 프로필 이미지 URL 삭제 성공 ===");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "프로필 이미지 삭제에 실패했습니다.");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("프로필 이미지 URL 삭제 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "이미지 삭제 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 카카오 사용자 프로필 이미지 테스트용 엔드포인트
     */
    @PutMapping("/kakao/{userId}")
    public ResponseEntity<Map<String, Object>> updateKakaoProfileImageUrl(
            @PathVariable String userId,
            @RequestBody Map<String, String> request) {
        
        log.info("카카오 사용자 프로필 이미지 업데이트 요청: userId={}", userId);
        
        String imageUrl = request.get("imageUrl");
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "이미지 URL이 필요합니다."
                    ));
        }

        try {
            boolean success = profileImageService.updateProfileImageUrl(userId, imageUrl.trim());
            
            if (success) {
                log.info("카카오 사용자 프로필 이미지 업데이트 성공: userId={}, imageUrl={}", userId, imageUrl);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "카카오 사용자 프로필 이미지가 업데이트되었습니다.",
                        "userId", userId,
                        "imageUrl", imageUrl
                ));
            } else {
                log.warn("카카오 사용자 프로필 이미지 업데이트 실패: userId={}", userId);
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "success", false,
                                "message", "카카오 사용자 프로필 이미지 업데이트에 실패했습니다."
                        ));
            }
        } catch (Exception e) {
            log.error("카카오 사용자 프로필 이미지 업데이트 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "서버 오류가 발생했습니다: " + e.getMessage()
                    ));
        }
    }
} 