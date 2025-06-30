package kr.co.kh.controller.cmmon;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.mapper.RunningCrewMapper;
import kr.co.kh.model.vo.RunningCrewVO;
import kr.co.kh.service.RunningCrewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/crews")
@CrossOrigin(origins = "http://localhost:3000")
public class RunningCrewController {

    private final RunningCrewService crewService;

    @PostMapping
    @ApiOperation(value = "크루 생성", notes = "새로운 크루를 생성합니다.")
    public ResponseEntity<?> createCrew(@RequestBody RunningCrewVO crew) {
        crewService.createCrew(crew);
        return ResponseEntity.ok("CREW CREATED");
    }

    @GetMapping
    @ApiOperation(value = "전체 크루 목록 조회", notes = "모든 크루 목록을 가져옵니다.")
    public List<RunningCrewVO> getAllCrews() {
        return crewService.getAllCrews();
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "크루 상세 조회", notes = "크루 ID로 상세 정보를 조회합니다.")
    public ResponseEntity<RunningCrewVO> getCrew(@PathVariable Long id) {
        return ResponseEntity.ok(crewService.getCrewById(id));
    }

    // ✅ 크루 수정
    @PutMapping("/{id}")
    @ApiOperation(value = "크루 수정", notes = "개설자만 해당 크루를 수정할 수 있습니다.")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "요청자 ID", required = true, paramType = "query")
    })
    public ResponseEntity<String> updateCrew(@PathVariable Long id,
                                             @RequestBody RunningCrewVO crew,
                                             @RequestParam String userId) {
        if (!crewService.isLeader(id, userId)) {
            return ResponseEntity.status(403).body("권한 없음");
        }

        crew.setCrewId(id);
        crewService.updateCrew(crew);
        return ResponseEntity.ok("수정 완료");
    }

    // ✅ 크루 삭제
    @DeleteMapping("/{id}")
    @ApiOperation(value = "크루 삭제", notes = "개설자만 해당 크루를 삭제할 수 있습니다.")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "요청자 ID", required = true, paramType = "query")
    })
    public ResponseEntity<String> deleteCrew(@PathVariable Long id,
                                             @RequestParam String userId) {
        if (!crewService.isLeader(id, userId)) {
            return ResponseEntity.status(403).body("권한 없음");
        }

        crewService.deleteCrew(id);
        return ResponseEntity.ok("삭제 완료");
    }
}