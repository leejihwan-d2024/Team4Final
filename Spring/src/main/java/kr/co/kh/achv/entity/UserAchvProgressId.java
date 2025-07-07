package kr.co.kh.achv.entity;

import java.io.Serializable;
import java.util.Objects;

public class UserAchvProgressId implements Serializable {
    private String userId;
    private String achvId;

    public UserAchvProgressId() {}

    public UserAchvProgressId(String userId, String achvId) {
        this.userId = userId;
        this.achvId = achvId;
    }

    // equals와 hashCode 반드시 구현해야 함
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserAchvProgressId)) return false;
        UserAchvProgressId that = (UserAchvProgressId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(achvId, that.achvId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, achvId);
    }

    // ===== 추가: getter / setter =====
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAchvId() {
        return achvId;
    }

    public void setAchvId(String achvId) {
        this.achvId = achvId;
    }
}
