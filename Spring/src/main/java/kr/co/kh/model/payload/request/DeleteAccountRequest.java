package kr.co.kh.model.payload.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter
@Setter
@AllArgsConstructor
public class DeleteAccountRequest {

    @NotBlank(message = "비밀번호는 필수 항목입니다.")
    private String password;

    public DeleteAccountRequest() {
    }
} 