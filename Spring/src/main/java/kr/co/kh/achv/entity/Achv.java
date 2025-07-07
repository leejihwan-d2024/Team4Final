package kr.co.kh.achv.entity;

import javax.persistence.*;

@Entity
@Table(name = "ACHV")
public class Achv {

    @Id
    @Column(name = "ACHV_ID")
    private String achvId;

    @Column(name = "ACHV_TITLE")
    private String achvTitle;

    @Column(name = "ACHV_CONTENT")
    private String achvContent;

    @Column(name = "ACHV_MAX_POINT")
    private Integer achvMaxPoint;

    @Column(name = "ACHV_SYSTEM")
    private String achvSystem;

    // 🔴 rewardId 필드는 실제 ACHV 테이블에 존재하지 않으므로 제거

    public Achv() {}

    // Getter / Setter
    public String getAchvId() {
        return achvId;
    }

    public void setAchvId(String achvId) {
        this.achvId = achvId;
    }

    public String getAchvTitle() {
        return achvTitle;
    }

    public void setAchvTitle(String achvTitle) {
        this.achvTitle = achvTitle;
    }

    public String getAchvContent() {
        return achvContent;
    }

    public void setAchvContent(String achvContent) {
        this.achvContent = achvContent;
    }

    public Integer getAchvMaxPoint() {
        return achvMaxPoint;
    }

    public void setAchvMaxPoint(Integer achvMaxPoint) {
        this.achvMaxPoint = achvMaxPoint;
    }

    public String getAchvSystem() {
        return achvSystem;
    }

    public void setAchvSystem(String achvSystem) {
        this.achvSystem = achvSystem;
    }

    // 기존 코드 호환을 위한 커스텀 getter
    public String getId() {
        return getAchvId();
    }

    public String getTitle() {
        return getAchvTitle();
    }

    public String getContent() {
        return getAchvContent();
    }

    public int getMaxPoint() {
        return achvMaxPoint != null ? achvMaxPoint : 0;
    }

    public Object getRewardId() {
        return null;
    }
}
