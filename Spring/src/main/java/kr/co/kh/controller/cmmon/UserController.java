package kr.co.kh.controller.cmmon;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.event.OnUserLogoutSuccessEvent;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.request.LogOutRequest;
import kr.co.kh.model.payload.response.ApiResponse;
import kr.co.kh.model.payload.response.UserResponse;
import kr.co.kh.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/user")
@Slf4j
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final ApplicationEventPublisher applicationEventPublisher;

    /**
     * 현재 사용자의 프로필 리턴
     * @param currentUser
     * @return
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "사용자 정보 확인")
    @ApiImplicitParam(name = "currentUser", value = "사용자 정보", dataType = "CustomUserDetails", dataTypeClass = CustomUserDetails.class, required = true)
    public ResponseEntity<?> getUserProfile(@CurrentUser CustomUserDetails currentUser) {
        UserResponse userResponse = new UserResponse(currentUser.getUsername(), currentUser.getEmail(), currentUser.getRoles());
        return ResponseEntity.ok(userResponse);
    }

    /**
     * 로그아웃
     * @param customUserDetails
     * @param logOutRequest
     * @return
     */
    @PostMapping("/logout")
    @ApiOperation(value = "로그아웃", notes = "로그아웃하면 로그아웃된 토큰을 별도로 저장해서 관리한다.")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "currentUser", value = "사용자 정보", dataType = "CustomUserDetails", dataTypeClass = CustomUserDetails.class, required = true),
            @ApiImplicitParam(name = "logOutRequest", value = "로그아웃 VO", dataType = "LogOutRequest", dataTypeClass = LogOutRequest.class, required = true)
    })
    public ResponseEntity<?> logoutUser(@CurrentUser CustomUserDetails customUserDetails,
                                     @Valid @RequestBody LogOutRequest logOutRequest) {
        log.info(customUserDetails.toString());
        log.info(logOutRequest.toString());
        userService.logoutUser(customUserDetails, logOutRequest);
        Object credentials = SecurityContextHolder.getContext().getAuthentication().getCredentials();

        OnUserLogoutSuccessEvent logoutSuccessEvent = new OnUserLogoutSuccessEvent(customUserDetails.getEmail(), credentials.toString(), logOutRequest);
        applicationEventPublisher.publishEvent(logoutSuccessEvent);
        return ResponseEntity.ok(new ApiResponse(true, "로그아웃 되었습니다."));
    }

}
