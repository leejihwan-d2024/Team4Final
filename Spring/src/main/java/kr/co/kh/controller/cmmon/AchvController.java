package kr.co.kh.controller.cmmon;

import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.dto.RewardResponse;
import kr.co.kh.service.AchievementService;
import kr.co.kh.service.RewardService;
import kr.co.kh.service.UserProgressService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
//@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/achievements")
public class AchvController {

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private UserProgressService userProgressService;

    @Autowired
    private RewardService rewardService;

    private String userId;

    // ✅ 전체 유저 업적 리스트 조회 (userId가 없으면 전체, 있으면 특정 유저)
    @GetMapping
    public List<UserAchvProgressDto> getAllAchvevements(@RequestParam(required = false) String userId) {
        if (userId != null) {
            return userProgressService.getUserProgress(userId);
        }
        return achievementService.getAllAchvevements();
    }

    // ✅ 현재 로그인한 유저의 전체 업적 진행 상태 조회
    @GetMapping("/user")
    public List<UserAchvProgressDto> getUserProgress(@RequestParam String userId) {
        return userProgressService.getUserProgress(userId);
    }

    // ✅ 현재 로그인한 유저의 "달성한" 업적만 조회
    @GetMapping("/completed")
    public List<UserAchvProgressDto> getCompletedAchievements(@RequestParam String userId) {
        return userProgressService.getCompletedAchievements(userId);
    }

    // ✅ 현재 로그인한 유저가 받은 뱃지 목록을 JSON으로 반환
    // name (업적명), date (달성일), badgeImageUrl (뱃지 이미지), badgeName (뱃지 이름)
    @GetMapping("/badges")
    public List<Map<String, Object>> getUserBadges(@RequestParam String userId) {
        return userProgressService.getUserBadges(userId);
    }



    // ✅ 테스트용 임시 데이터 반환
    @GetMapping("/test")
    public List<Map<String, Object>> getAllAchvevements() {
        return List.of(
                Map.of(
                        "achv_id", "ACHV01",
                        "achv_title", "첫 로그인",
                        "achv_content", "앱에 처음 로그인했습니다!",
                        "current_value", 1,
                        "achv_max_point", 1,
                        "is_completed", "Y",
                        "is_claimed", "N"
                ),
                Map.of(
                        "achv_id", "ACHV02",
                        "achv_title", "게시글 작성",
                        "achv_content", "처음으로 게시글을 작성했습니다!",
                        "current_value", 5,
                        "achv_max_point", 10,
                        "is_completed", "N",
                        "is_claimed", "N"
                )
        );
    }

    // ✅ 업적 진행도 업데이트
    @PostMapping("/progress")
    public void updateProgress(
            @RequestParam String userId,
            @RequestParam String achvId,
            @RequestParam int value
    ) {
        userProgressService.updateProgress(userId, achvId, value);
    }

    // ✅ 보상 요청 처리 - JSON 형태의 RewardResponse 반환
    @GetMapping("/reward")
    public ResponseEntity<RewardResponse> claimReward(
            @CurrentUser CustomUserDetails user,
            @RequestParam String achvId
    ) {
        try {
            log.info(user.getUserId());
            log.info(user.getUsername());
            String userId = user.getUserId();
            RewardResponse response = rewardService.claimReward(userId, achvId);

            switch (response.getResult()) {
                case SUCCESS:
                case ALREADY_CLAIMED:
                    return ResponseEntity.ok(response);
                case NO_REWARD_MAPPING:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                default:
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    new RewardResponse(RewardService.RewardResult.NO_REWARD_MAPPING, null, null)
            );
        }
    }
}
