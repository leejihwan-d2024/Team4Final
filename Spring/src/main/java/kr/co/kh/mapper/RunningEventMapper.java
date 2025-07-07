// RunningEventMapper.java
package kr.co.kh.mapper;

import kr.co.kh.model.vo.RunningEventVO;
import kr.co.kh.model.vo.EventParticipantVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RunningEventMapper {
    void insertEvent(RunningEventVO event);
    List<RunningEventVO> selectAllEvents();
    RunningEventVO selectEventById(Long eventId);
    void updateEvent(RunningEventVO event);
    void deleteEvent(Long eventId);

    void insertEventParticipant(EventParticipantVO participant);
    boolean isEventParticipantExists(@Param("eventId") Long eventId, @Param("userId") String userId);
}
