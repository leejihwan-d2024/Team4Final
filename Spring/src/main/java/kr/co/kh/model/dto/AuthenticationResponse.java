package kr.co.kh.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private String id;
    private String rawId;
    private String response;
    private String clientDataJSON;
    private String authenticatorData;
    private String signature;
    private String userHandle;
    private String type;
	
	
	
    @Data
    public static class AuthenticationResponseData {
        private String clientDataJSON;
        private String authenticatorData;
        private String signature;
        private String userHandle;
    }
} 