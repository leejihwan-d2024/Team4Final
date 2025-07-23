package kr.co.kh.controller.cmmon;

import kr.co.kh.model.vo.ChatMessageVO;
import kr.co.kh.service.ChatService; // ✅ 추가
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;

@Slf4j
@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService; // ✅ DB 저장을 위한 서비스 주입

    @MessageMapping("/chatroom/{crewId}")
    public void sendMessage(@DestinationVariable String crewId, ChatMessageVO message) {
        log.info("📥 받은 메시지 - 크루ID: {}, 내용: {}", crewId, message);

        // 필수 정보 설정
        message.setCrewId(crewId);
        message.setSentAt(LocalDateTime.now());

        // ✅ DB 저장
        chatService.saveMessage(message);
        log.info("💾 메시지 DB 저장 완료 - {}", message);

        // ✅ 실시간 브로드캐스트
        String topic = "/topic/crew/" + crewId;
        log.info("📡 브로드캐스트 시도 - {}", topic);
        messagingTemplate.convertAndSend(topic, message);
        log.info("✅ 브로드캐스트 완료 - {}", message);
    }
}