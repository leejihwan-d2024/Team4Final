package kr.co.kh.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageVO {
    private Long messageId;       // ✅ 이거 추가
    private String crewId;
    private String senderId;
    private String content;
    private LocalDateTime sentAt;
}