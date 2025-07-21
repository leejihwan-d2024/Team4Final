package kr.co.kh.model.payload.request;

import kr.co.kh.model.payload.KakaoUserInfo;
import kr.co.kh.model.payload.DeviceInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
public class KakaoLoginRequest {

    @NotBlank(message = "카카오 액세스 토큰은 필수 항목입니다.")
    private String accessToken;

    @Valid
    @NotNull(message = "카카오 사용자 정보는 필수 항목입니다.")
    private KakaoUserInfo userInfo;

    @Valid
    private DeviceInfo deviceInfo;

    public KakaoLoginRequest() {
    }
} 