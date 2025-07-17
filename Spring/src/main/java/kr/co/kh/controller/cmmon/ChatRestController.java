package kr.co.kh.controller.cmmon;

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
@CrossOrigin(origins = "http://localhost:3000")
public class ChatRestController {

    private final ChatService chatService;

    // 특정 크루 채팅 메시지 목록 조회 (GET /api/chat/{crewId})
    @GetMapping("/{crewId}")
    public ResponseEntity<List<ChatMessageVO>> getMessagesByCrewId(@PathVariable String crewId) {
        log.info("채팅 메시지 요청 - 크루ID: {}", crewId);

        List<ChatMessageVO> messages = chatService.getMessagesByCrewId(crewId);

        if (messages.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(messages);
    }
}
