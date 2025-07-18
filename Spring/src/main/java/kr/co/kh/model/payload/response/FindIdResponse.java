package kr.co.kh.model.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FindIdResponse {
    
    private boolean success;
    private String message;
    private String userId;
    
    public static FindIdResponse success(String userId) {
        return new FindIdResponse(true, "아이디 찾기 이메일이 발송되었습니다.", userId);
    }
    
    public static FindIdResponse failure(String message) {
        return new FindIdResponse(false, message, null);
    }
} 