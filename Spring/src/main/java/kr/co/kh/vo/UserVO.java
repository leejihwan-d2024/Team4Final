package kr.co.kh.vo;

import lombok.Data;
import java.util.Date;

@Data
public class UserVO {
    private String userId;
    private String userPw;
    private String userNn;
    private String userEmail;
    private String userDefloc;
    private String userPhoneno;
    private int userStatus;
    private Date userSignUp;
    private Date userLastLogin;
    private String userProfileImageUrl;
    private int userPoint;
    private int userActivePoint;
}