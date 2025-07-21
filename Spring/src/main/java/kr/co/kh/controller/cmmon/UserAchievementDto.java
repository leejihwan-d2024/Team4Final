package kr.co.kh.controller.cmmon;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Setter
@Getter
@NoArgsConstructor
@ToString
public class UserAchievementDto {
    private String achvId;
    private String achvTitle;
    private String achvContent;
    private int achvMaxPoint;
    private int currentValue;
    private String isRewarded;
    private String achievedDate;
    private int rewardId;
    private String rewardType;
    private String rewardValue;
    private String badgeName;
    private String badgeImageUrl;
    private String isComplete;// "완료" 또는 ""

    public UserAchievementDto(String achvId, String achvTitle, String achvContent,
                              int achvMaxPoint, int currentValue, String isRewarded,
                              String achievedDate, int rewardId, String rewardType,
                              String rewardValue, String badgeName, String badgeImageUrl,
                              String isComplate) {
        this.achvId = achvId;
        this.achvTitle = achvTitle;
        this.achvContent = achvContent;
        this.achvMaxPoint = achvMaxPoint;
        this.currentValue = currentValue;
        this.isRewarded = isRewarded;
        this.achievedDate = achievedDate;
        this.rewardId = rewardId;
        this.rewardType = rewardType;
        this.rewardValue = rewardValue;
        this.badgeName = badgeName;
        this.badgeImageUrl = badgeImageUrl;
        this.isComplete = isComplate;

    }

    public UserAchievementDto(String ignoredAchvId, String ignoredAchvTitle, String ignoredAchvContent, int ignoredCurrentValue, Integer ignoredAchvMaxPoint, String ignoredIsRewarded ) {
        this.achvId = ignoredAchvId;
        this.achvTitle = ignoredAchvTitle;
        this.achvContent = ignoredAchvContent;
        this.currentValue = ignoredCurrentValue;
        this.achvMaxPoint = ignoredAchvMaxPoint;
        this.isRewarded = ignoredIsRewarded;
    }

    // 필요 시 setter 추가
}
