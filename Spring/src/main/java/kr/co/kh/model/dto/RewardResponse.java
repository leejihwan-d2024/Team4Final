package kr.co.kh.model.dto;

import kr.co.kh.service.RewardService.RewardResult;

public class RewardResponse {
    private RewardResult result;
    private String badgeName;
    private String badgeImageUrl;

    public RewardResponse(RewardResult result, String badgeName, String badgeImageUrl) {
        this.result = result;
        this.badgeName = badgeName;
        this.badgeImageUrl = badgeImageUrl;
    }

    // ❗ 사용하지 않는 생성자라면 삭제해도 됩니다
    public RewardResponse(String ignoredSuccess, String ignoredBadgeName, String ignoredBadgeImageUrl) {}

    public RewardResult getResult() { return result; }

    public String getBadgeName() { return badgeName; }

    public String getBadgeImageUrl() { return badgeImageUrl; }  // ✅ 수정된 부분

    public void setResult(RewardResult result) {
        this.result = result;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public void setBadgeImageUrl(String badgeImageUrl) {
        this.badgeImageUrl = badgeImageUrl;
    }
}
