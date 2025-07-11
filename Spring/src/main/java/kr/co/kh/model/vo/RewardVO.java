package kr.co.kh.model.vo;  // 또는 entity 대신 vo 패키지 사용 가능

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RewardVO {
    private Long rewardId;      // 보상 ID (PK)
    private String achvId;        // 업적 ID
    private String rewardType;    // 보상명
    private String rewardValue;   // 설명
    private String badgeName;
    private String badgeImage;
    // 기본 생성자
    public RewardVO() {}


}
