package kr.co.kh.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionVO {
    
    private String sessionId;
    private String userId;
    private String userIp;
    private String userAgent;
    private Date loginTime;
    private Date lastAccessTime;
    private Date expireTime;
    private boolean active;
    private String deviceInfo;
    private String location;
} 