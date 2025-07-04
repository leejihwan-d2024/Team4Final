package kr.co.kh.mapper;



import kr.co.kh.model.vo.ChatMessageVO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ChatMessageMapper {

    // 특정 크루 채팅 메시지 목록 조회 (최신 순)
    List<ChatMessageVO> selectMessagesByCrewId(Long crewId);

    // 채팅 메시지 저장
    void insertChatMessage(ChatMessageVO message);
}