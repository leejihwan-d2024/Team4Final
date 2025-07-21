package kr.co.kh.model.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import kr.co.kh.validation.annotation.NullOrNotBlank;
import lombok.*;

import javax.validation.constraints.NotNull;

@ToString
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegistrationRequest {

    @NullOrNotBlank(message = "아이디는 필수입니다.")
    @JsonProperty("userId")
    private String username;

    @NullOrNotBlank(message = "이메일은 필수입니다.")
    @JsonProperty("userEmail")
    private String email;

    @NotNull(message = "비밀번호는 필수입니다.")
    @JsonProperty("userPw")
    private String password;

    @JsonProperty("userNn")
    private String name;

    @JsonProperty("userPhoneno")
    private String phoneno;

    @JsonProperty("userProfileImageUrl")
    private String profileImageUrl;

    private int roleNum;

}
