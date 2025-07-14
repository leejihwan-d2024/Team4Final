package kr.co.kh.controller.cmmon;

import kr.co.kh.model.vo.CrewMemberVO;
import kr.co.kh.service.CrewMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/crew-members")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    @PostMapping
    public ResponseEntity<String> joinCrew(@RequestBody CrewMemberVO crewMember) {
        crewMemberService.joinCrew(crewMember);
        return ResponseEntity.ok("참가 완료");
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkUserCrewJoinStatus(
            @RequestParam Long crewId,
            @RequestParam String userId
    ) {
        boolean hasJoined = crewMemberService.hasUserJoinedCrew(crewId, userId);
        Map<String, Boolean> result = new HashMap<>();
        result.put("hasJoined", hasJoined);
        return ResponseEntity.ok(result);
    }
}
