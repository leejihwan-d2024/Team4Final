package kr.co.kh.model.vo;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class UserAchvProgress {
    private String achvId;
    private String achvTitle;
    private String achvContent;
    private int currentValue;
    private int achvMaxPoint;
    private String isCompleted;
    private String badgeName;
    private String badgeImageUrl;
    private String achievedDate;

}
