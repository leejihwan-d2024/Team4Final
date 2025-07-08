package kr.co.kh.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private String id;
    private String rawId;
    private String response;
    private String clientDataJSON;
    private String attestationObject;
    private String type;
} 