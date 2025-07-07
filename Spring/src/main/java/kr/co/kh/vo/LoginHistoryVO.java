package kr.co.kh.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistoryVO {
    
    private Long id;
    private String userId;
    private String loginIp;
    private String userAgent;
    private String loginStatus; // SUCCESS, FAILED, LOCKED
    private String failReason;
    private Date loginTime;
    private String sessionId;
    private String deviceType; // WEB, MOBILE, TABLET
    private String location; // 로그인 위치 (IP 기반)
} 