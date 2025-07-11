package kr.co.kh.model.dto;

import kr.co.kh.service.RewardService.RewardResult;

public class RewardResponse {
    private RewardResult result;
    private String badgeName;
    private String badgeImage;

    public RewardResponse(RewardResult result, String badgeName, String badgeImage) {
        this.result = result;
        this.badgeName = badgeName;
        this.badgeImage = badgeImage;
    }

    public RewardResponse(String success, String badgeName) {
    }

    public RewardResult getResult() {
        return result;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public String getBadgeImage() {
        return badgeImage;
    }

    public void setResult(RewardResult result) {
        this.result = result;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public void setBadgeImage(String badgeImage) {
        this.badgeImage = badgeImage;
    }
}
