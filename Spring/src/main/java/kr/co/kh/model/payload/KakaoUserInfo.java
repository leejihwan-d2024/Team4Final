package kr.co.kh.model.payload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Getter
@Setter
@AllArgsConstructor
public class KakaoUserInfo {

    @NotBlank(message = "카카오 사용자 ID는 필수 항목입니다.")
    private String id;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String nickname;

    private String profileImage;

    public KakaoUserInfo() {
    }
} 