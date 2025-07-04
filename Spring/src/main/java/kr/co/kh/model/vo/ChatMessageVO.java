package kr.co.kh.model.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ChatMessageVO {
    private Long crewId;
    private String senderId;
    private String content;
    private LocalDateTime sentAt; // ISO 문자열 or Date
}