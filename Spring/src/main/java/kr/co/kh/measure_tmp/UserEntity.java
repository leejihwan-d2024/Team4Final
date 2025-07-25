package kr.co.kh.measure_tmp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

// UserEntity.java
@Entity
@Table(name = "USERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    @Id
    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "USER_PW")
    private String userPw;

    @Column(name = "USER_NN")
    private String userNn;

    @Column(name = "USER_EMAIL")
    private String userEmail;

    @Column(name = "USER_DEFLOC")
    private String userDefloc;

    @Column(name = "USER_PHONENO")
    private String userPhoneNo;

    @Column(name = "USER_STATUS")
    private Integer userStatus;

    @Column(name = "USER_SIGN_UP")
    private LocalDateTime userSignUp;

    @Column(name = "USER_LAST_LOGIN")
    private LocalDateTime userLastLogin;

    @Column(name = "USER_PROFILE_IMAGE_URL")
    private String userProfileImageUrl;

    @Column(name = "USER_POINT")
    private Integer userPoint;

    @Column(name = "USER_ACTIVE_POINT")
    private Integer userActivePoint;

    @Column(name = "KAKAO_ID")
    private String kakaoId;

    @Column(name = "PROVIDER")
    private String provider;
}

