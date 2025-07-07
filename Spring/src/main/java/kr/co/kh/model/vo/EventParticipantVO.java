package kr.co.kh.model.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class EventParticipantVO {

    private long eventId;       // 이벤트 ID (FK)
    private String userId;        // 참가자 사용자 ID (FK)
    private Integer status;       // 참가 상태 (기본 1)
    private Date participatedAt;  // 참가 일자 (기본 SYSDATE)
}