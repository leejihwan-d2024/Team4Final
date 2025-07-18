package kr.co.kh.achv.entity;

import lombok.ToString;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@IdClass(UserAchvProgressId.class)
@Table(name = "USER_ACHV_PROGRESS")
@ToString
public class UserAchvProgress implements Serializable {

    @Id
    @Column(name = "USER_ID")
    private String userId;

    @Id
    @Column(name = "ACHV_ID")
    private String achvId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ACHV_ID", insertable = false, updatable = false)
    private Achv achv;

    @Column(name = "IS_COMPLETED")
    private String isCompleted;

    @Column(name = "CURRENT_VALUE")
    private int currentValue;

    public UserAchvProgress() {}

    // Getter / Setter
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAchvId() { return achvId; }
    public void setAchvId(String achvId) { this.achvId = achvId; }

    public Achv getAchv() { return achv; }
    public void setAchv(Achv achv) { this.achv = achv; }

    public String getIsCompleted() { return isCompleted; }
    public void setIsCompleted(String isCompleted) { this.isCompleted = isCompleted; }

    public int getCurrentValue() { return currentValue; }
    public void setCurrentValue(int currentValue) { this.currentValue = currentValue; }
}
