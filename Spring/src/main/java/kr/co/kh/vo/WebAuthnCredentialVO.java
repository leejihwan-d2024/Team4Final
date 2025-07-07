package kr.co.kh.vo;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebAuthnCredentialVO {
    
    private String credentialId;
    private String userId;
    private String publicKey;
    private String attestationObject;
    private String clientDataJSON;
    private String authenticatorData;
    private String signature;
    private String userHandle;
    private String type;
    private Date createdAt;
    private Date lastUsedAt;
    private int signCount;
    private boolean active;
} 