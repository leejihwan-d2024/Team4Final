package kr.co.kh.controller.auth;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.exception.TokenRefreshException;
import kr.co.kh.exception.UserLoginException;
import kr.co.kh.exception.UserRegistrationException;
import kr.co.kh.model.payload.request.LoginRequest;
import kr.co.kh.model.payload.request.LogOutRequest;
import kr.co.kh.model.payload.request.RegistrationRequest;
import kr.co.kh.model.payload.request.TokenRefreshRequest;
import kr.co.kh.model.payload.request.UpdatePasswordRequest;
import kr.co.kh.model.payload.request.UpdateProfileRequest;
import kr.co.kh.model.payload.request.DeleteAccountRequest;
import kr.co.kh.model.payload.request.KakaoLoginRequest;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.response.ApiResponse;
import kr.co.kh.model.payload.response.JwtAuthenticationResponse;
import kr.co.kh.model.token.RefreshToken;
import kr.co.kh.security.JwtTokenProvider;
import kr.co.kh.service.AuthService;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/auth")
@Slf4j
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    /**
     * 이메일 사용여부 확인
     */
    @ApiOperation(value = "이메일 사용여부 확인")
    @ApiImplicitParam(name = "email", value = "이메일", dataType = "String", required = true)
    @GetMapping("/check/email")
    public ResponseEntity<?> checkEmailInUse(@RequestParam("email") String email) {
        boolean emailExists = authService.emailAlreadyExists(email);
        return ResponseEntity.ok(new ApiResponse(true, emailExists ? "이미 사용중인 이메일입니다." : "사용 가능한 이메일입니다."));
    }

    /**
     * userId 사용여부 확인
     */
    @ApiOperation(value = "아이디 사용여부 확인")
    @ApiImplicitParam(name = "userId", value = "아이디", dataType = "String", required = true)
    @GetMapping("/check/userId")
    public ResponseEntity<?> checkUserIdInUse(@RequestParam("userId") String userId) {
        boolean userIdExists = authService.usernameAlreadyExists(userId);
        return ResponseEntity.ok(new ApiResponse(true, userIdExists ? "이미 사용중인 아이디입니다." : "사용 가능한 아이디입니다."));
    }


    /**
     * 로그인 성공시 access token, refresh token 반환
     */
    @ApiOperation(value = "로그인")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "아이디", dataType = "String", required = true),
            @ApiImplicitParam(name = "userPw", value = "비밀번호", dataType = "String", required = true),
            @ApiImplicitParam(name = "deviceInfo", value = "장치정보", dataType = "DeviceInfo", required = true)
    })
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("로그인 요청 받음: username={}, password={}, deviceInfo={}", 
            loginRequest.getUsername(), 
            loginRequest.getPassword() != null ? "***" : "null", 
            loginRequest.getDeviceInfo());

        Authentication authentication = authService.authenticateUser(loginRequest)
                .orElseThrow(() -> new UserLoginException("아이디 또는 비밀번호가 올바르지 않습니다."));

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("사용자 로그인 성공: {}", customUserDetails.getUserId());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return authService.createAndPersistRefreshTokenForDevice(authentication, loginRequest)
                .map(RefreshToken::getToken)
                .map(refreshToken -> {
                    String jwtToken = authService.generateToken(customUserDetails);
                    JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwtToken, refreshToken, tokenProvider.getExpiryDuration());
                    response.setUserInfo(customUserDetails.getUserId(), customUserDetails.getEmail(), customUserDetails.getName());
                    return ResponseEntity.ok(response);
                })
                .orElseThrow(() -> new UserLoginException("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요."));
    }

    /**
     * 특정 장치에 대한 refresh token 을 사용하여 만료된 jwt token 을 갱신 후 새로운 token 을 반환
     */
    @ApiOperation(value = "리프레시 토큰")
    @ApiImplicitParam(name = "refreshToken", value = "TokenRefreshRequest 객체", dataType = "String", required = true)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshJwtToken(@Valid @RequestBody TokenRefreshRequest tokenRefreshRequest) {

        log.info(tokenRefreshRequest.toString());

        return authService.refreshJwtToken(tokenRefreshRequest)
                .map(updatedToken -> {
                    String refreshToken = tokenRefreshRequest.getRefreshToken();
                    log.info("Created new Jwt Auth token: {}", updatedToken);
                    return ResponseEntity.ok(new JwtAuthenticationResponse(updatedToken, refreshToken, tokenProvider.getExpiryDuration()));
                })
                .orElseThrow(() -> new TokenRefreshException(tokenRefreshRequest.getRefreshToken(), "토큰 갱신 중 오류가 발생했습니다. 다시 로그인 해 주세요."));
    }

    /**
     * 회원 가입
     * @param request
     * @return
     */
    @ApiOperation(value = "회원가입")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "아이디", dataType = "String", required = true),
            @ApiImplicitParam(name = "userEmail", value = "이메일", dataType = "String", required = true),
            @ApiImplicitParam(name = "userPw", value = "비밀번호", dataType = "String", required = true),
            @ApiImplicitParam(name = "userNn", value = "이름", dataType = "String", required = true)
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest request) {
        log.info("회원가입 요청: {}", request.getUsername());
        return authService.registerUser(request).map(userVO -> {
            log.info("회원가입 성공: {}", userVO.getUserId());
            return ResponseEntity.ok(new ApiResponse(true, "회원가입이 완료되었습니다."));
        }).orElseThrow(() -> new UserRegistrationException(request.getUsername(), "회원가입 처리 중 오류가 발생했습니다."));
    }

    /**
     * 로그아웃
     */
    @ApiOperation(value = "로그아웃")
    @ApiImplicitParam(name = "logOutRequest", value = "로그아웃 요청 정보", dataType = "LogOutRequest", required = true)
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@Valid @RequestBody LogOutRequest logOutRequest) {
        log.info("로그아웃 요청: {}", logOutRequest.getDeviceInfo().getDeviceId());
        authService.logoutUser(logOutRequest);
        return ResponseEntity.ok(new ApiResponse(true, "로그아웃이 완료되었습니다."));
    }

    /**
     * 비밀번호 변경
     */
    @ApiOperation(value = "비밀번호 변경")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "currentPassword", value = "현재 비밀번호", dataType = "String", required = true),
            @ApiImplicitParam(name = "newPassword", value = "새 비밀번호", dataType = "String", required = true)
    })
    @PostMapping("/password/update")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest updatePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("비밀번호 변경 요청: {}", customUserDetails.getUserId());
        authService.updatePassword(updatePasswordRequest, customUserDetails.getUserId());
        return ResponseEntity.ok(new ApiResponse(true, "비밀번호가 성공적으로 변경되었습니다."));
    }

    /**
     * 사용자 정보 조회
     */
    @ApiOperation(value = "사용자 정보 조회")
    @ApiImplicitParam(name = "userId", value = "사용자명", dataType = "String", required = true)
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserInfo(@PathVariable String userId) {
        log.info("사용자 정보 조회 요청: {}", userId);
        return authService.getUserInfo(userId)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 사용자 프로필 수정
     */
    @ApiOperation(value = "사용자 프로필 수정")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "email", value = "이메일", dataType = "String", required = false),
            @ApiImplicitParam(name = "name", value = "이름", dataType = "String", required = false)
    })
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest updateProfileRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("프로필 수정 요청: {}", customUserDetails.getUserId());
        authService.updateProfile(updateProfileRequest, customUserDetails.getUserId());
        return ResponseEntity.ok(new ApiResponse(true, "프로필이 성공적으로 수정되었습니다."));
    }

    /**
     * 계정 삭제
     */
    @ApiOperation(value = "계정 삭제")
    @ApiImplicitParam(name = "password", value = "비밀번호 확인", dataType = "String", required = true)
    @DeleteMapping("/account/delete")
    public ResponseEntity<?> deleteAccount(@Valid @RequestBody DeleteAccountRequest deleteAccountRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("계정 삭제 요청: {}", customUserDetails.getUserId());
        authService.deleteAccount(deleteAccountRequest, customUserDetails.getUserId());
        return ResponseEntity.ok(new ApiResponse(true, "계정이 성공적으로 삭제되었습니다."));
    }

    /**
     * 카카오 로그인
     */
    @ApiOperation(value = "카카오 로그인")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "accessToken", value = "카카오 액세스 토큰", dataType = "String", required = true),
            @ApiImplicitParam(name = "userInfo", value = "카카오 사용자 정보", dataType = "KakaoUserInfo", required = true)
    })
    @PostMapping("/kakao/login")
    public ResponseEntity<?> kakaoLogin(@Valid @RequestBody KakaoLoginRequest kakaoLoginRequest) {
        log.info("카카오 로그인 요청: {}", kakaoLoginRequest.getUserInfo().getEmail());
        
        return authService.kakaoLogin(kakaoLoginRequest)
                .map(authentication -> {
                    CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
                    log.info("카카오 로그인 성공: {}", customUserDetails.getUserId());
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    return authService.createAndPersistRefreshTokenForDevice(authentication, createLoginRequestFromKakao(kakaoLoginRequest))
                            .map(RefreshToken::getToken)
                            .map(refreshToken -> {
                                String jwtToken = authService.generateToken(customUserDetails);
                                JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwtToken, refreshToken, tokenProvider.getExpiryDuration());
                                response.setUserInfo(customUserDetails.getUserId(), customUserDetails.getEmail(), customUserDetails.getName());
                                return ResponseEntity.ok(response);
                            })
                            .orElseThrow(() -> new UserLoginException("카카오 로그인 처리 중 오류가 발생했습니다."));
                })
                .orElseThrow(() -> new UserLoginException("카카오 로그인에 실패했습니다."));
    }

    /**
     * 카카오 로그인 요청을 일반 로그인 요청으로 변환
     * @param kakaoLoginRequest
     * @return
     */
    private LoginRequest createLoginRequestFromKakao(KakaoLoginRequest kakaoLoginRequest) {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername("kakao_" + kakaoLoginRequest.getUserInfo().getId());
        loginRequest.setPassword("kakao_password"); // 카카오 사용자는 비밀번호가 없으므로 더미 값
        loginRequest.setDeviceInfo(kakaoLoginRequest.getDeviceInfo());
        return loginRequest;
    }

    /**
     * 테스트용 사용자 생성 (개발용)
     */
    @ApiOperation(value = "테스트용 사용자 생성")
    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            RegistrationRequest testUser = new RegistrationRequest();
            testUser.setUsername("333");
            testUser.setPassword("333");
            testUser.setEmail("test@test.com");
            testUser.setName("테스트 사용자");
            
            log.info("테스트 사용자 생성 시작: username={}", testUser.getUsername());
            authService.registerUser(testUser);
            log.info("테스트 사용자 생성 완료");
            return ResponseEntity.ok(new ApiResponse(true, "테스트 사용자가 생성되었습니다."));
        } catch (Exception e) {
            log.error("테스트 사용자 생성 실패", e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "테스트 사용자 생성에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 사용자 조회 테스트 (개발용)
     */
    @ApiOperation(value = "사용자 조회 테스트")
    @GetMapping("/test-user/{username}")
    public ResponseEntity<?> getTestUser(@PathVariable String username) {
        try {
            log.info("사용자 조회 테스트: username={}", username);
            Optional<UserVO> user = authService.getUserInfo(username);
            if (user.isPresent()) {
                UserVO userVO = user.get();
                log.info("사용자 조회 성공: userId={}, userNn={}, userEmail={}", 
                    userVO.getUserId(), userVO.getUserNn(), userVO.getUserEmail());
                return ResponseEntity.ok(userVO);
            } else {
                log.warn("사용자를 찾을 수 없음: username={}", username);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("사용자 조회 테스트 실패", e);
            return ResponseEntity.badRequest().body(new ApiResponse(false, "사용자 조회에 실패했습니다: " + e.getMessage()));
        }
    }

}
