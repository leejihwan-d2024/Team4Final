package kr.co.kh.controller.cmmon;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import kr.co.kh.model.vo.CrewMemberVO;
import kr.co.kh.service.CrewMemberService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crew-members")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "🏃‍♂️ 크루 참가 API", description = "사용자의 크루 참가 및 참가 여부 확인 API입니다.")
public class CrewMemberController {

    private final CrewMemberService crewMemberService;

    @Operation(
            summary = "크루 참가 요청",
            description = "사용자가 특정 크루에 참가하도록 요청합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "참가 완료"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    })
    @PostMapping
    public ResponseEntity<String> joinCrew(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "크루 참가 정보 (userId, crewId 포함)",
                    required = true,
                    content = @Content(schema = @Schema(implementation = CrewMemberVO.class))
            )
            @RequestBody CrewMemberVO crewMember
    ) {
        crewMemberService.joinCrew(crewMember);
        return ResponseEntity.ok("참가 완료");
    }

    @Operation(
            summary = "크루 참가 여부 확인",
            description = "해당 사용자가 특정 크루에 이미 참가했는지 여부를 확인합니다."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "참가 여부 반환 (true/false)")
    })
    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkIfJoined(
            @Parameter(description = "크루 ID", example = "crew123")
            @RequestParam String crewId,
            @Parameter(description = "사용자 ID", example = "user456")
            @RequestParam String userId
    ) {
        boolean exists = crewMemberService.existsByCrewIdAndUserId(crewId, userId);
        return ResponseEntity.ok(exists);
    }
}