package kr.co.kh.model.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FindPasswordResponse {
    
    private boolean success;
    private String message;
    
    public static FindPasswordResponse success() {
        return new FindPasswordResponse(true, "비밀번호 재설정 이메일이 발송되었습니다.");
    }
    
    public static FindPasswordResponse failure(String message) {
        return new FindPasswordResponse(false, message);
    }
} 