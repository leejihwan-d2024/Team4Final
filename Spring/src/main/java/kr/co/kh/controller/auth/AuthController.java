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
import kr.co.kh.model.payload.request.FindIdRequest;
import kr.co.kh.model.payload.request.FindPasswordRequest;
import kr.co.kh.model.payload.request.ResetPasswordRequest;
import kr.co.kh.model.payload.DeviceInfo;
import kr.co.kh.model.vo.DeviceType;
import kr.co.kh.model.payload.response.FindIdResponse;
import kr.co.kh.model.payload.response.FindPasswordResponse;
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

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Optional;

@RestController
@CrossOrigin(origins = {"http://localhost:3000", "http://200.200.200.72:3000"})
@RequestMapping("/api/auth")
@Slf4j
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    /**
     * 서버 상태 확인
     */
    @ApiOperation(value = "서버 상태 확인")
    @GetMapping("/check")
    public ResponseEntity<?> checkServerStatus() {
        log.info("=== 서버 상태 확인 요청 ===");
        log.info("서버가 정상적으로 실행 중입니다.");
        log.info("현재 시간: {}", java.time.LocalDateTime.now());
        return ResponseEntity.ok(new ApiResponse(true, "서버가 정상 작동 중입니다."));
    }

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
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        log.info("=== 사용자 로그인 요청 ===");
        log.info("사용자명: {}", loginRequest.getUsername());
        log.info("비밀번호: {}", loginRequest.getPassword() != null ? "***" : "null");
        log.info("장치 정보: {}", loginRequest.getDeviceInfo());
        log.info("User-Agent: {}", request.getHeader("User-Agent"));
        log.info("Origin: {}", request.getHeader("Origin"));
        log.info("Content-Type: {}", request.getHeader("Content-Type"));
        log.info("Accept: {}", request.getHeader("Accept"));
        log.info("Request Method: {}", request.getMethod());
        log.info("Request URL: {}", request.getRequestURL());
        log.info("Remote Address: {}", request.getRemoteAddr());
        
        // DeviceInfo가 null인 경우 자동 생성
        DeviceInfo deviceInfo = loginRequest.getDeviceInfo();
        if (deviceInfo == null) {
            String userAgent = request.getHeader("User-Agent");
            DeviceType detectedType = DeviceInfo.detectDeviceType(userAgent);
            String deviceId = DeviceInfo.generateDeviceId(userAgent, loginRequest.getUsername());
            
            deviceInfo = new DeviceInfo(deviceId, detectedType, null);
            loginRequest.setDeviceInfo(deviceInfo);
            
            log.info("DeviceInfo 자동 생성: {}", deviceInfo);
        } else {
            // DeviceInfo 자동 감지 및 수정
            String userAgent = request.getHeader("User-Agent");
            DeviceType detectedType = DeviceInfo.detectDeviceType(userAgent);
            
            // WEB으로 설정된 경우 실제 디바이스 타입으로 변경
            if (deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.WEB || 
                deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.web) {
                deviceInfo.setDeviceType(detectedType);
                log.info("디바이스 타입 자동 감지: {} -> {}", 
                    (deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.WEB ? "WEB" : "web"), 
                    detectedType.getValue());
            }
        }
        
        log.info("================================");

        Authentication authentication = authService.authenticateUser(loginRequest)
                .orElseThrow(() -> {
                    log.error("=== 로그인 인증 실패 ===");
                    log.error("사용자명: {}", loginRequest.getUsername());
                    log.error("================================");
                    return new UserLoginException("아이디 또는 비밀번호가 올바르지 않습니다.");
                });

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        log.info("=== 사용자 인증 성공 ===");
        log.info("사용자 ID: {}", customUserDetails.getUserId());
        log.info("사용자 이메일: {}", customUserDetails.getEmail());
        log.info("사용자 이름: {}", customUserDetails.getName());
        log.info("================================");

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return authService.createAndPersistRefreshTokenForDevice(authentication, loginRequest)
                .map(RefreshToken::getToken)
                .map(refreshToken -> {
                    log.info("=== 토큰 생성 시작 ===");
                    String jwtToken = authService.generateToken(customUserDetails);
                    JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwtToken, refreshToken, tokenProvider.getExpiryDuration());
                    response.setUserInfo(customUserDetails.getUserId(), customUserDetails.getEmail(), customUserDetails.getName());
                    
                    log.info("=== 로그인 완료 ===");
                    log.info("사용자 ID: {}", customUserDetails.getUserId());
                    log.info("JWT 토큰 길이: {} characters", jwtToken.length());
                    log.info("Refresh 토큰 길이: {} characters", refreshToken.length());
                    log.info("토큰 만료 시간: {} ms", tokenProvider.getExpiryDuration());
                    log.info("================================");
                    
                    return ResponseEntity.ok(response);
                })
                .orElseThrow(() -> {
                    log.error("=== 로그인 처리 실패 ===");
                    log.error("사용자명: {}", loginRequest.getUsername());
                    log.error("================================");
                    return new UserLoginException("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
                });
    }

    /**
     * 특정 장치에 대한 refresh token 을 사용하여 만료된 jwt token 을 갱신 후 새로운 token 을 반환
     */
    @ApiOperation(value = "리프레시 토큰")
    @ApiImplicitParam(name = "refreshToken", value = "TokenRefreshRequest 객체", dataType = "String", required = true)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshJwtToken(@Valid @RequestBody TokenRefreshRequest tokenRefreshRequest) {

        log.info("=== JWT 토큰 갱신 요청 ===");
        log.info("요청 정보: {}", tokenRefreshRequest.toString());
        log.info("================================");

        return authService.refreshJwtToken(tokenRefreshRequest)
                .map(updatedToken -> {
                    String refreshToken = tokenRefreshRequest.getRefreshToken();
                    
                    log.info("=== JWT 토큰 갱신 완료 ===");
                    log.info("새로운 JWT 토큰 길이: {} characters", updatedToken.length());
                    log.info("Refresh 토큰 길이: {} characters", refreshToken.length());
                    log.info("================================");
                    
                    return ResponseEntity.ok(new JwtAuthenticationResponse(updatedToken, refreshToken, tokenProvider.getExpiryDuration()));
                })
                .orElseThrow(() -> {
                    log.error("=== JWT 토큰 갱신 실패 ===");
                    log.error("Refresh 토큰: {}", tokenRefreshRequest.getRefreshToken());
                    log.error("================================");
                    return new TokenRefreshException(tokenRefreshRequest.getRefreshToken(), "토큰 갱신 중 오류가 발생했습니다. 다시 로그인 해 주세요.");
                });
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
            @ApiImplicitParam(name = "userNn", value = "이름", dataType = "String", required = true),
            @ApiImplicitParam(name = "userProfileImageUrl", value = "프로필 이미지 URL", dataType = "String", required = false)
    })
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest request) {
        log.info("=== 회원가입 요청 ===");
        log.info("아이디: {}", request.getUsername());
        log.info("이메일: {}", request.getEmail());
        log.info("이름: {}", request.getName());
        log.info("프로필 이미지 URL: {}", request.getProfileImageUrl());
        log.info("================================");
        
        return authService.registerUser(request).map(userVO -> {
            log.info("=== 회원가입 성공 ===");
            log.info("사용자 ID: {}", userVO.getUserId());
            log.info("프로필 이미지 URL: {}", userVO.getUserProfileImageUrl());
            log.info("================================");
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
        log.info("=== 사용자 로그아웃 요청 ===");
        log.info("장치 ID: {}", logOutRequest.getDeviceInfo().getDeviceId());
        log.info("장치 정보: {}", logOutRequest.getDeviceInfo());
        log.info("================================");
        
        authService.logoutUser(logOutRequest);
        
        log.info("=== 로그아웃 처리 완료 ===");
        log.info("장치 ID: {}", logOutRequest.getDeviceInfo().getDeviceId());
        log.info("================================");
        
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
     * 자동 로그인 상태 확인
     */
    @ApiOperation(value = "자동 로그인 상태 확인")
    @GetMapping("/auto-login")
    public ResponseEntity<?> checkAutoLogin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("=== 자동 로그인 상태 확인 ===");
        log.info("인증 정보: {}", authentication);
        
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication.getPrincipal() instanceof String) && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            
            CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
            log.info("자동 로그인 성공 - 사용자: {}", customUserDetails.getUserId());
            log.info("================================");
            
            return ResponseEntity.ok(new ApiResponse(true, "자동 로그인 성공"));
        } else {
            log.info("자동 로그인 실패 - 인증되지 않은 사용자");
            log.info("================================");
            return ResponseEntity.status(401).body(new ApiResponse(false, "자동 로그인 실패"));
        }
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
        log.info("=== 카카오 로그인 요청 시작 ===");
        log.info("사용자 이메일: {}", kakaoLoginRequest.getUserInfo().getEmail());
        log.info("카카오 ID: {}", kakaoLoginRequest.getUserInfo().getId());
        log.info("액세스 토큰 길이: {} characters", kakaoLoginRequest.getAccessToken().length());
        log.info("================================");
        
        return authService.kakaoLogin(kakaoLoginRequest)
                .map(authentication -> {
                    CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
                    log.info("=== 카카오 로그인 성공 ===");
                    log.info("사용자 ID: {}", customUserDetails.getUserId());
                    log.info("사용자 이메일: {}", customUserDetails.getEmail());
                    log.info("사용자 이름: {}", customUserDetails.getName());
                    log.info("================================");
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    return authService.createAndPersistRefreshTokenForDevice(authentication, createLoginRequestFromKakao(kakaoLoginRequest))
                            .map(RefreshToken::getToken)
                            .map(refreshToken -> {
                                String jwtToken = authService.generateToken(customUserDetails);
                                JwtAuthenticationResponse response = new JwtAuthenticationResponse(jwtToken, refreshToken, tokenProvider.getExpiryDuration());
                                
                                // 카카오 사용자의 경우 올바른 정보 설정
                                String userId = customUserDetails.getUserId();
                                String email = customUserDetails.getEmail();
                                String name = customUserDetails.getName();
                                
                                // 카카오 사용자인 경우 실제 닉네임 사용
                                if (userId.startsWith("kakao_")) {
                                    // 카카오 사용자의 경우 실제 닉네임을 username으로 사용
                                    log.info("=== 카카오 사용자 응답 정보 설정 ===");
                                    log.info("userId: {}", userId);
                                    log.info("email: {}", email);
                                    log.info("name: {}", name);
                                    log.info("================================");
                                    response.setUserInfo(name, email, name);
                                } else {
                                    response.setUserInfo(userId, email, name);
                                }
                                
                                log.info("=== 카카오 로그인 완료 ===");
                                log.info("JWT 토큰 길이: {} characters", jwtToken.length());
                                log.info("Refresh 토큰 길이: {} characters", refreshToken.length());
                                log.info("토큰 만료 시간: {} ms", tokenProvider.getExpiryDuration());
                                log.info("================================");
                                
                                return ResponseEntity.ok(response);
                            })
                            .orElseThrow(() -> {
                                log.error("=== 카카오 로그인 처리 실패 ===");
                                log.error("사용자 ID: {}", customUserDetails.getUserId());
                                log.error("================================");
                                return new UserLoginException("카카오 로그인 처리 중 오류가 발생했습니다.");
                            });
                })
                .orElseThrow(() -> {
                    log.error("=== 카카오 로그인 인증 실패 ===");
                    log.error("사용자 이메일: {}", kakaoLoginRequest.getUserInfo().getEmail());
                    log.error("카카오 ID: {}", kakaoLoginRequest.getUserInfo().getId());
                    log.error("================================");
                    return new UserLoginException("카카오 로그인 인증에 실패했습니다.");
                });
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
        
        // DeviceInfo가 null인 경우 기본값 생성
        DeviceInfo deviceInfo = kakaoLoginRequest.getDeviceInfo();
        if (deviceInfo == null) {
            deviceInfo = new DeviceInfo();
            deviceInfo.setDeviceId("kakao_device_" + kakaoLoginRequest.getUserInfo().getId());
            deviceInfo.setDeviceType(kr.co.kh.model.vo.DeviceType.OTHER);
            deviceInfo.setNotificationToken(null);
            log.info("카카오 로그인용 기본 장치정보 생성: {}", deviceInfo.getDeviceId());
        } else {
            // deviceInfo가 있지만 deviceType이 WEB인 경우 자동 감지
            if (deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.WEB || 
                deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.web) {
                // User-Agent를 통해 실제 디바이스 타입 감지
                // 실제 구현에서는 HttpServletRequest가 필요하므로 여기서는 로그만 남김
                log.info("카카오 로그인: WEB 디바이스 타입 감지됨 - 실제 디바이스 타입 확인 필요");
            }
        }
        
        loginRequest.setDeviceInfo(deviceInfo);
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

    /**
     * 아이디 찾기
     */
    @ApiOperation(value = "아이디 찾기")
    @ApiImplicitParam(name = "email", value = "이메일", dataType = "String", required = true)
    @PostMapping("/find-id")
    public ResponseEntity<?> findUserId(@Valid @RequestBody FindIdRequest findIdRequest) {
        log.info("=== AuthController.findUserId 호출됨 ===");
        log.info("이메일: {}", findIdRequest.getEmail());
        
        try {
            log.info("AuthService.findUserIdByEmail 호출 시작...");
            FindIdResponse response = authService.findUserIdByEmail(findIdRequest);
            log.info("AuthService.findUserIdByEmail 호출 완료");
            
            if (response.isSuccess()) {
                log.info("=== 아이디 찾기 성공 ===");
                log.info("이메일: {}", findIdRequest.getEmail());
                log.info("응답 메시지: {}", response.getMessage());
                log.info("================================");
                return ResponseEntity.ok(new ApiResponse(true, response.getMessage()));
            } else {
                log.warn("=== 아이디 찾기 실패 ===");
                log.warn("이메일: {}, 오류: {}", findIdRequest.getEmail(), response.getMessage());
                log.warn("================================");
                return ResponseEntity.ok(new ApiResponse(false, response.getMessage()));
            }
        } catch (Exception e) {
            log.error("=== 아이디 찾기 중 오류 ===");
            log.error("이메일: {}, 오류: {}", findIdRequest.getEmail(), e.getMessage(), e);
            log.error("================================");
            return ResponseEntity.ok(new ApiResponse(false, "아이디 찾기 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 찾기
     */
    @ApiOperation(value = "비밀번호 찾기")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "아이디", dataType = "String", required = true),
            @ApiImplicitParam(name = "email", value = "이메일", dataType = "String", required = true)
    })
    @PostMapping("/find-password")
    public ResponseEntity<?> findPassword(@Valid @RequestBody FindPasswordRequest findPasswordRequest) {
        log.info("=== 비밀번호 찾기 요청 ===");
        log.info("아이디: {}, 이메일: {}", findPasswordRequest.getUserId(), findPasswordRequest.getEmail());
        
        try {
            FindPasswordResponse response = authService.findPasswordByUserIdAndEmail(findPasswordRequest);
            
            if (response.isSuccess()) {
                log.info("=== 비밀번호 찾기 성공 ===");
                log.info("아이디: {}, 이메일: {}", findPasswordRequest.getUserId(), findPasswordRequest.getEmail());
                log.info("================================");
                return ResponseEntity.ok(new ApiResponse(true, response.getMessage()));
            } else {
                log.warn("=== 비밀번호 찾기 실패 ===");
                log.warn("아이디: {}, 이메일: {}, 오류: {}", 
                    findPasswordRequest.getUserId(), findPasswordRequest.getEmail(), response.getMessage());
                log.warn("================================");
                return ResponseEntity.ok(new ApiResponse(false, response.getMessage()));
            }
        } catch (Exception e) {
            log.error("=== 비밀번호 찾기 중 오류 ===");
            log.error("아이디: {}, 이메일: {}, 오류: {}", 
                findPasswordRequest.getUserId(), findPasswordRequest.getEmail(), e.getMessage(), e);
            log.error("================================");
            return ResponseEntity.ok(new ApiResponse(false, "비밀번호 찾기 중 오류가 발생했습니다."));
        }
    }

    /**
     * 비밀번호 재설정
     */
    @ApiOperation(value = "비밀번호 재설정")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "userId", value = "아이디", dataType = "String", required = true),
            @ApiImplicitParam(name = "token", value = "재설정 토큰", dataType = "String", required = true),
            @ApiImplicitParam(name = "newPassword", value = "새 비밀번호", dataType = "String", required = true)
    })
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        log.info("=== 비밀번호 재설정 요청 ===");
        log.info("아이디: {}", resetPasswordRequest.getUserId());
        
        try {
            boolean success = authService.resetPassword(resetPasswordRequest);
            
            if (success) {
                log.info("=== 비밀번호 재설정 성공 ===");
                log.info("아이디: {}", resetPasswordRequest.getUserId());
                log.info("================================");
                return ResponseEntity.ok(new ApiResponse(true, "비밀번호가 성공적으로 재설정되었습니다."));
            } else {
                log.warn("=== 비밀번호 재설정 실패 ===");
                log.warn("아이디: {}", resetPasswordRequest.getUserId());
                log.warn("================================");
                return ResponseEntity.ok(new ApiResponse(false, "비밀번호 재설정에 실패했습니다. 토큰을 확인해주세요."));
            }
        } catch (Exception e) {
            log.error("=== 비밀번호 재설정 중 오류 ===");
            log.error("아이디: {}, 오류: {}", resetPasswordRequest.getUserId(), e.getMessage(), e);
            log.error("================================");
            return ResponseEntity.ok(new ApiResponse(false, "비밀번호 재설정 중 오류가 발생했습니다."));
        }
    }

    /**
     * 이메일 설정 확인
     */
    @ApiOperation(value = "이메일 설정 확인")
    @GetMapping("/check-email-config")
    public ResponseEntity<?> checkEmailConfig() {
        log.info("=== 이메일 설정 확인 요청 ===");
        
        try {
            // 이메일 서비스 주입 확인
            if (authService.isEmailServiceAvailable()) {
                log.info("이메일 서비스가 정상적으로 설정되었습니다.");
                return ResponseEntity.ok(new ApiResponse(true, "이메일 서비스가 정상적으로 설정되었습니다. 실제 이메일이 발송됩니다."));
            } else {
                log.warn("이메일 서비스 설정이 완료되지 않았습니다.");
                return ResponseEntity.ok(new ApiResponse(false, "이메일 서비스 설정이 완료되지 않았습니다. 로그 모드로 동작합니다."));
            }
        } catch (Exception e) {
            log.error("이메일 설정 확인 중 오류 발생", e);
            return ResponseEntity.ok(new ApiResponse(false, "이메일 설정 확인 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 이메일 테스트 발송
     */
    @ApiOperation(value = "이메일 테스트 발송")
    @ApiImplicitParam(name = "email", value = "테스트 이메일 주소", dataType = "String", required = true)
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String email) {
        log.info("=== 이메일 테스트 발송 요청 ===");
        log.info("테스트 이메일: {}", email);
        
        try {
            boolean success = authService.sendTestEmail(email);
            
            if (success) {
                log.info("=== 이메일 테스트 발송 성공 ===");
                log.info("테스트 이메일: {}", email);
                log.info("================================");
                return ResponseEntity.ok(new ApiResponse(true, "테스트 이메일이 성공적으로 발송되었습니다."));
            } else {
                log.warn("=== 이메일 테스트 발송 실패 ===");
                log.warn("테스트 이메일: {}", email);
                log.warn("================================");
                return ResponseEntity.ok(new ApiResponse(false, "테스트 이메일 발송에 실패했습니다."));
            }
        } catch (Exception e) {
            log.error("=== 이메일 테스트 발송 중 오류 ===");
            log.error("테스트 이메일: {}, 오류: {}", email, e.getMessage(), e);
            log.error("================================");
            return ResponseEntity.ok(new ApiResponse(false, "이메일 테스트 발송 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}
