package kr.co.kh.service;

import kr.co.kh.mapper.ChatMessageMapper;
import kr.co.kh.model.vo.ChatMessageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageMapper chatMapper;

    // 메시지 저장
    public void saveMessage(ChatMessageVO message) {
        chatMapper.insertChatMessage(message);
    }

    // 특정 크루 채팅 메시지 목록 조회
    public List<ChatMessageVO> getMessagesByCrewId(Long crewId) {
        return chatMapper.selectMessagesByCrewId(crewId);
    }
}