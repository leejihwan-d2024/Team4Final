// RunningEventController.java
package kr.co.kh.controller.cmmon;

import kr.co.kh.model.vo.RunningEventVO;
import kr.co.kh.service.RunningEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class RunningEventController {

    private final RunningEventService eventService;

    @PostMapping
    public ResponseEntity<String> createEvent(@RequestBody RunningEventVO event) {
        eventService.createEvent(event);
        return ResponseEntity.ok("이벤트 생성 완료");
    }

    @GetMapping
    public List<RunningEventVO> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<RunningEventVO> getEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getEventById(eventId));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<String> updateEvent(@PathVariable Long eventId, @RequestBody RunningEventVO event) {
        event.setEventId(eventId);
        eventService.updateEvent(event);
        return ResponseEntity.ok("이벤트 수정 완료");
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long eventId) {
        eventService.deleteEvent(eventId);
        return ResponseEntity.ok("이벤트 삭제 완료");
    }

    @PostMapping("/{eventId}/join")
    public ResponseEntity<String> participateEvent(@PathVariable Long eventId, @RequestParam String userId) {
        eventService.participateEvent(eventId, userId);
        return ResponseEntity.ok("이벤트 참가 완료");
    }
}