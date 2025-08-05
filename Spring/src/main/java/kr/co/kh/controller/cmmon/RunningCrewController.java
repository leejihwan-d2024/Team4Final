package kr.co.kh.controller.cmmon;

import io.swagger.annotations.*;

import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.vo.RunningCrewVO;
import kr.co.kh.service.RunningCrewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crews")
@Api(tags = " 러닝 크루 API", description = "크루 생성, 조회, 수정, 삭제 및 최근 활동 조회 기능 제공")
public class RunningCrewController {

    private final RunningCrewService crewService;

    @PostMapping
    @ApiOperation(value = "크루 생성", notes = "로그인한 사용자가 리더로 설정되어 새로운 크루를 생성합니다.")
    public ResponseEntity<?> createCrew(@AuthenticationPrincipal CustomUserDetails currentUser,
                                        @RequestBody RunningCrewVO crew) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        if (crew.getCrewId() == null || crew.getCrewId().isEmpty()) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String randomStr = generateRandomString(3);
            String newCrewId = timestamp + "_" + randomStr;
            crew.setCrewId(newCrewId);
        }

        crew.setLeaderId(currentUser.getUserId());
        crew.setLeaderNn(currentUser.getName());
        crew.setCreatedAt(LocalDateTime.now());
        crew.setCurrentCount(1);

        crewService.createCrew(crew);
        return ResponseEntity.ok("CREW CREATED");
    }

    @GetMapping("/defaultId")
    @ApiOperation(value = "새로운 크루 ID 생성", notes = "현재 시간과 랜덤 문자열을 조합해 새로운 크루 ID를 생성합니다.")
    public ResponseEntity<String> generateNewCrewId() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String randomStr = generateRandomString(3);
        String newCrewId = timestamp + "_" + randomStr;
        log.info("생성된 새로운 크루ID: {}", newCrewId);
        return ResponseEntity.ok(newCrewId);
    }

    private String generateRandomString(int length) {
        final String charPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int idx = random.nextInt(charPool.length());
            sb.append(charPool.charAt(idx));
        }
        return sb.toString();
    }

    @GetMapping
    @ApiOperation(value = "전체 크루 목록 조회", notes = "현재 존재하는 모든 크루 목록을 조회합니다.")
    public List<RunningCrewVO> getAllCrews() {
        return crewService.getAllCrews();
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "크루 상세 조회", notes = "크루 ID를 이용해 특정 크루의 상세 정보를 조회합니다.")
    public ResponseEntity<RunningCrewVO> getCrew(@PathVariable String id) {
        return ResponseEntity.ok(crewService.getCrewById(id));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "크루 수정", notes = "해당 크루의 개설자만 수정할 수 있습니다.")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "요청자 ID", required = true, paramType = "query")
    })
    public ResponseEntity<String> updateCrew(@PathVariable String id,
                                             @RequestBody RunningCrewVO crew,
                                             @RequestParam String userId) {
        if (!crewService.isLeader(id, userId)) {
            return ResponseEntity.status(403).body("권한 없음");
        }
        crew.setCrewId(id);
        crewService.updateCrew(crew);
        return ResponseEntity.ok("수정 완료");
    }

    @DeleteMapping("/{id}")
    @ApiOperation(value = "크루 삭제", notes = "해당 크루의 개설자만 삭제할 수 있습니다.")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "요청자 ID", required = true, paramType = "query")
    })
    public ResponseEntity<String> deleteCrew(@PathVariable String id,
                                             @RequestParam String userId) {
        if (!crewService.isLeader(id, userId)) {
            return ResponseEntity.status(403).body("권한 없음");
        }
        crewService.deleteCrew(id);
        return ResponseEntity.ok("삭제 완료");
    }

    @GetMapping("/getrecentjoin/{userId}")
    @ApiOperation(value = "최근 참가 크루 조회", notes = "해당 사용자가 최근에 참가한 크루 목록을 반환합니다.")
    public ResponseEntity<List<Map<String, Object>>> getRecentJoinCrews(@PathVariable String userId) {
        return ResponseEntity.ok(crewService.getRecentJoinedCrews(userId));
    }

    @GetMapping("/getrecentcreate/{userId}")
    @ApiOperation(value = "최근 생성 크루 조회", notes = "해당 사용자가 최근에 생성한 크루 목록을 반환합니다.")
    public ResponseEntity<List<Map<String, Object>>> getRecentCreatedCrews(@PathVariable String userId) {
        return ResponseEntity.ok(crewService.getRecentCreatedCrews(userId));
    }

    @GetMapping("/joined")
    @ApiOperation(value = "내가 속한 크루 목록 조회", notes = "사용자가 참가한 모든 크루 목록을 조회합니다.")
    @ApiImplicitParam(name = "userId", value = "사용자 ID", required = true, paramType = "query")
    public ResponseEntity<List<RunningCrewVO>> getJoinedCrews(@RequestParam String userId) {
        List<RunningCrewVO> crews = crewService.getCrewsByUserId(userId);
        return ResponseEntity.ok(crews);
    }
}
