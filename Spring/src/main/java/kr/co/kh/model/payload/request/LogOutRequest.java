package kr.co.kh.model.payload.request;

import kr.co.kh.model.payload.DeviceInfo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LogOutRequest {

    @Valid
    private DeviceInfo deviceInfo;

}
