// RunningEventService.java
package kr.co.kh.service;

import kr.co.kh.mapper.RunningEventMapper;
import kr.co.kh.model.vo.RunningEventVO;
import kr.co.kh.model.vo.EventParticipantVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RunningEventService {

    private final RunningEventMapper eventMapper;

    public void createEvent(RunningEventVO event) {
        eventMapper.insertEvent(event);
    }

    public List<RunningEventVO> getAllEvents() {
        return eventMapper.selectAllEvents();
    }

    public RunningEventVO getEventById(Long eventId) {
        return eventMapper.selectEventById(eventId);
    }

    public void updateEvent(RunningEventVO event) {
        eventMapper.updateEvent(event);
    }

    public void deleteEvent(Long eventId) {
        eventMapper.deleteEvent(eventId);
    }

    public void participateEvent(Long eventId, String userId) {
        if (eventMapper.isEventParticipantExists(eventId, userId)) {
            throw new IllegalArgumentException("이미 참가한 사용자입니다.");
        }
        EventParticipantVO participant = new EventParticipantVO();
        participant.setEventId(eventId);
        participant.setUserId(userId);
        participant.setStatus(1); // 기본 참가 상태

        eventMapper.insertEventParticipant(participant);
    }
}
