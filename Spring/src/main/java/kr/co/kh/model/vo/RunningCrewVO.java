package kr.co.kh.model.vo;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class RunningCrewVO {
    private Long crewId;
    private String crewTitle;
    private String leaderNn;
    private LocalDateTime startTime;
    private String startLocation;
    private String startLocationMapPoint;
    private String endLocation;
    private String endLocationMapPoint;
    private String district;
    private LocalDateTime createdAt;
    private Integer isOver15;
    private String leaderId;
    private int currentCount;
}
