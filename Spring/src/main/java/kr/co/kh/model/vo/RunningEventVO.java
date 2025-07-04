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
public class RunningEventVO {

    private long eventId;             // 이벤트 고유 ID (PK)
    private String eventTitle;          // 제목 (유니크)
    private String eventContent;        // 내용
    private Date startTime;             // 시작 시간
    private Date endTime;               // 종료 시간
    private String startLocation;       // 출발 위치
    private String endLocation;         // 도착 위치
    private Date createdAt;             // 생성 일자 (기본값 SYSDATE)
}
