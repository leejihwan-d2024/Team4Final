package kr.co.kh.controller.cmmon;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.mapper.RunningCrewMapper;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.vo.RunningCrewVO;
import kr.co.kh.service.RunningCrewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/crews")
public class RunningCrewController {

    private final RunningCrewService crewService;

    // 크루 생성 - 로그인 사용자 자동 리더 설정 + crewId 자동 생성
    @PostMapping
    @ApiOperation(value = "크루 생성", notes = "로그인한 사용자가 리더로 설정되어 새로운 크루를 생성합니다.")
    public ResponseEntity<?> createCrew(@AuthenticationPrincipal CustomUserDetails currentUser,
                                        @RequestBody RunningCrewVO crew) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        // crewId가 비어있으면 새로 생성
        if (crew.getCrewId() == null || crew.getCrewId().isEmpty()) {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String randomStr = generateRandomString(3);
            String newCrewId = timestamp + "_" + randomStr;
            crew.setCrewId(newCrewId);
        }

        // 로그인 사용자 정보로 리더 세팅
        crew.setLeaderId(currentUser.getUserId());
        crew.setLeaderNn(currentUser.getName());

        // 기본 필드 세팅
        crew.setCreatedAt(LocalDateTime.now());
        crew.setCurrentCount(1); // 리더 포함

        crewService.createCrew(crew);
        return ResponseEntity.ok("CREW CREATED");
    }

    @GetMapping("/defaultId")
    @ApiOperation(value = "새로운 크루 ID 생성", notes = "현재 시간과 랜덤 문자열을 조합해 크루 ID를 생성합니다.")
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
    @ApiOperation(value = "전체 크루 목록 조회", notes = "모든 크루 목록을 가져옵니다.")
    public List<RunningCrewVO> getAllCrews() {
        return crewService.getAllCrews();
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "크루 상세 조회", notes = "크루 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<RunningCrewVO> getCrew(@PathVariable String id) {
        return ResponseEntity.ok(crewService.getCrewById(id));
    }

    @PutMapping("/{id}")
    @ApiOperation(value = "크루 수정", notes = "개설자만 해당 크루를 수정할 수 있습니다.")
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
    @ApiOperation(value = "크루 삭제", notes = "개설자만 해당 크루를 삭제할 수 있습니다.")
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

    //최근 참가활동 조회
    @GetMapping("/getrecentjoin/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getRecentJoinCrews(@PathVariable String userId) {
        return ResponseEntity.ok(crewService.getRecentJoinedCrews(userId));
    }
    //최근 생성활동 조회
    @GetMapping("/getrecentcreate/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getRecentCreatedCrews(@PathVariable String userId) {
        return ResponseEntity.ok(crewService.getRecentCreatedCrews(userId));
    }
}