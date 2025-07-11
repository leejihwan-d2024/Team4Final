package kr.co.kh.model.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import kr.co.kh.model.payload.DeviceInfo;
import kr.co.kh.validation.annotation.NullOrNotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {

    @NullOrNotBlank(message = "아이디는 필수 항목입니다.")
    @JsonProperty("username")
    private String username;

    @NotNull(message = "비밀번호는 필수 항목입니다.")
    @JsonProperty("password")
    private String password;

    private DeviceInfo deviceInfo;

}
