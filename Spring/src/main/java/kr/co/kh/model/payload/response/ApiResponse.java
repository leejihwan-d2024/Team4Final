package kr.co.kh.model.payload.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import kr.co.kh.util.Util;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {

    private final String data;
    private final Boolean success;
    private final String timestamp;
    private final String cause;
    private final String path;

    public ApiResponse(Boolean success, String data, String cause, String path) {
        this.timestamp = Util.InstantToString();
        this.data = data;
        this.success = success;
        this.cause = cause;
        this.path = path;
    }

    public ApiResponse(Boolean success, String data) {
        this.timestamp = Util.InstantToString();
        this.data = data;
        this.success = success;
        this.cause = null;
        this.path = null;
    }

}
