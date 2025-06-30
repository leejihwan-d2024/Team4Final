package kr.co.kh.controller.cmmon;

import kr.co.kh.model.vo.CrewMemberVO;
import kr.co.kh.service.CrewMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/crew-members")
@RequiredArgsConstructor
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    @PostMapping
    public ResponseEntity<String> joinCrew(@RequestBody CrewMemberVO crewMember) {
        crewMemberService.joinCrew(crewMember);
        return ResponseEntity.ok("참가 완료");
    }
}
