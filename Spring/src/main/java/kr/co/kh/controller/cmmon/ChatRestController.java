package kr.co.kh.controller.cmmon;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import kr.co.kh.model.vo.ChatMessageVO;
import kr.co.kh.service.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
@Tag(name = "🗨️ 채팅 API", description = "크루별 채팅 메시지를 조회하는 API입니다.")
public class ChatRestController {

    private final ChatService chatService;

    @Operation(
            summary = "크루 채팅 메시지 목록 조회",
            description = "특정 크루 ID에 해당하는 채팅 메시지를 시간순으로 조회합니다.",
            tags = {" 채팅 API"}
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "메시지 조회 성공"),
            @ApiResponse(responseCode = "204", description = "메시지가 없음"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{crewId}")

    public ResponseEntity<List<ChatMessageVO>> getMessagesByCrewId(
            @Parameter(description = "크루 ID", example = "crew123") @PathVariable String crewId
    ) {
        log.info("채팅 메시지 요청 - 크루ID: {}", crewId);

        List<ChatMessageVO> messages = chatService.getMessagesByCrewId(crewId);

        if (messages.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(messages);
    }
}