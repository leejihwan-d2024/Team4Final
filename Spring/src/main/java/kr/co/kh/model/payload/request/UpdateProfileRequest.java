package kr.co.kh.model.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;

@Getter
@Setter
@AllArgsConstructor
public class UpdateProfileRequest {

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String name;

    public UpdateProfileRequest() {
    }
} 