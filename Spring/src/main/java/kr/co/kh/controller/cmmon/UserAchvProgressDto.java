package kr.co.kh.controller.cmmon;

public class UserAchvProgressDto {
    private String achvId;
    private String achvTitle;
    private String achvContent;
    private int currentValue;
    private int achvMaxPoint;
    private String isCompleted;
    private String badgeName;
    private String badgeImageUrl;

    public UserAchvProgressDto(String achvId, String achvTitle, String achvContent,
                               int currentValue, int achvMaxPoint, String isCompleted) {
        this.achvId = achvId;
        this.achvTitle = achvTitle;
        this.achvContent = achvContent;
        this.currentValue = currentValue;
        this.achvMaxPoint = achvMaxPoint;
        this.isCompleted = isCompleted;
    }

    public String getAchvId() {
        return achvId;
    }

    public String getAchvTitle() {
        return achvTitle;
    }

    public String getAchvContent() {
        return achvContent;
    }

    public int getCurrentValue() {
        return currentValue;
    }

    public int getAchvMaxPoint() {
        return achvMaxPoint;
    }

    public String getIsCompleted() {
        return isCompleted;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public String getBadgeImageUrl() {
        return badgeImageUrl;
    }

    public void setBadgeImageUrl(String badgeImageUrl) {
        this.badgeImageUrl = badgeImageUrl;
    }

    // 필요하면 setter도 추가 가능
}
