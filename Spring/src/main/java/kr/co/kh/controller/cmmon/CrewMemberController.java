package kr.co.kh.controller.cmmon;

import kr.co.kh.model.vo.CrewMemberVO;
import kr.co.kh.service.CrewMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkIfJoined(
            @RequestParam String crewId,
            @RequestParam String userId
    ) {
        boolean exists = crewMemberService.existsByCrewIdAndUserId(crewId, userId);
        return ResponseEntity.ok(exists);
    }
}
