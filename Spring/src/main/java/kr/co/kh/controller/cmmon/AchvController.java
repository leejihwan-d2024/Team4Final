package kr.co.kh.controller.cmmon;

import kr.co.kh.achv.entity.Achv;
import kr.co.kh.service.AchievementService;
import kr.co.kh.service.RewardService;
import kr.co.kh.service.RewardService.RewardResult;
import kr.co.kh.service.UserProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/achievements")
public class AchvController {

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private UserProgressService userProgressService;

    @Autowired
    private RewardService rewardService;

    // 전체 유저 업적 리스트 조회
    @GetMapping
    public List<Achv> getAllAchievements() {
        return achievementService.getAllAchievements();
    }

    // 특정 유저 업적 진행 상태 조회
    @GetMapping("/user/{userId}")
    public List<UserAchievementDto> getUserProgress(@PathVariable String userId) {
        return userProgressService.getUserProgress(userId);
    }

    // 테스트용 임시 데이터 반환
    @GetMapping("/test")
    public List<Map<String, Object>> getTestAchievements() {
        return List.of(
                Map.of(
                        "achv_id", "ACHV01",
                        "achv_title", "첫 로그인",
                        "achv_content", "앱에 처음 로그인했습니다!",
                        "current_value", 1,
                        "achv_max_point", 1,
                        "is_completed", "Y"
                ),
                Map.of(
                        "achv_id", "ACHV02",
                        "achv_title", "게시글 작성",
                        "achv_content", "처음으로 게시글을 작성했습니다!",
                        "current_value", 5,
                        "achv_max_point", 10,
                        "is_completed", "N"
                )
        );
    }

    // 업적 진행도 업데이트
    @PostMapping("/progress")
    public void updateProgress(
            @RequestParam String userId,
            @RequestParam String achvId,
            @RequestParam int value
    ) {
        userProgressService.updateProgress(userId, achvId, value);
    }

    // ✅ 보상 요청 처리 (파라미터명 통일: achvId 사용)
    @GetMapping("/reward")
    public ResponseEntity<String> claimReward(
            @RequestParam String userId,
            @RequestParam String achvId
    ) {
        try {
            RewardResult result = rewardService.claimReward(userId, achvId);

            switch (result) {
                case SUCCESS:
                    return ResponseEntity.ok("🎉 보상 지급 완료!");
                case ALREADY_CLAIMED:
                    return ResponseEntity.ok("이미 보상을 받았습니다.");
                case NO_REWARD_MAPPING:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("보상 정보가 존재하지 않습니다.");
                default:
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("알 수 없는 오류가 발생했습니다.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생: " + e.getMessage());
        }
    }
}
