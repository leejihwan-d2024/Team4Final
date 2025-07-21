package kr.co.kh.controller.cmmon;

import kr.co.kh.achv.entity.Achv;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.dto.RewardResponse;
import kr.co.kh.service.AchievementService;
import kr.co.kh.service.RewardService;
import kr.co.kh.service.UserProgressService;
import kr.co.kh.service.RewardService.RewardResult;
import kr.co.kh.controller.cmmon.UserAchvProgressDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

        import java.util.List;

@Slf4j
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/achievements")
public class AchvController {

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private UserProgressService userProgressService;

    @Autowired
    private RewardService rewardService;

    // 전체 업적 조회
    @GetMapping(produces = "application/json")
    public List<Achv> getAllAchievements() {
        return achievementService.getAllAchievements();
    }

    // 특정 유저의 업적 진행 상태 조회
    @GetMapping(value = "/user", produces = "application/json")
    public ResponseEntity<List<UserAchvProgressDto>> getUserProgress(@CurrentUser CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<UserAchvProgressDto> list = userProgressService.getUserProgress(user.getUserId());
        return ResponseEntity.ok(list);
    }

    // 업적 진행도 업데이트
    @PostMapping("/progress")
    public ResponseEntity<Void> updateProgress(
            @RequestParam String userId,
            @RequestParam String achvId,
            @RequestParam int value
    ) {
        userProgressService.updateProgress(userId, achvId, value);
        return ResponseEntity.ok().build();
    }

    // 보상 요청 처리 - JSON 형태의 뱃지 응답
    @GetMapping(value = "/reward", produces = "application/json")
    public ResponseEntity<RewardResponse> claimReward(
            @CurrentUser CustomUserDetails user,
            @RequestParam String achvId
    ) {
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("🎯 유저 아이디: {}", user.getUserId());

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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RewardResponse(RewardResult.NO_REWARD_MAPPING, null, null));
        }
    }
}