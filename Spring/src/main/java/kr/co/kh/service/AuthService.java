package kr.co.kh.service;

import kr.co.kh.exception.ResourceAlreadyInUseException;
import kr.co.kh.exception.TokenRefreshException;
import kr.co.kh.model.*;
import kr.co.kh.model.payload.request.LoginRequest;
import kr.co.kh.model.payload.request.LogOutRequest;
import kr.co.kh.model.payload.request.RegistrationRequest;
import kr.co.kh.model.payload.request.TokenRefreshRequest;
import kr.co.kh.model.payload.request.UpdatePasswordRequest;
import kr.co.kh.model.payload.request.UpdateProfileRequest;
import kr.co.kh.model.payload.request.DeleteAccountRequest;
import kr.co.kh.model.payload.request.KakaoLoginRequest;
import kr.co.kh.model.payload.KakaoUserInfo;
import kr.co.kh.model.payload.DeviceInfo;
import kr.co.kh.service.KakaoApiService;
import kr.co.kh.model.token.RefreshToken;
import kr.co.kh.model.vo.UserAuthorityVO;
import kr.co.kh.vo.UserVO;
import kr.co.kh.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class AuthService {

    private final UserServiceInterface userServiceInterface;
    private final RoleService roleService;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDeviceService userDeviceService;
    private final UserAuthorityService userAuthorityService;
    private final KakaoApiService kakaoApiService;

    /**
     * 사용자 등록 (MyBatis 기반)
     * @param newRegistrationRequest
     * @return
     */
    public Optional<UserVO> registerUser(RegistrationRequest newRegistrationRequest) {
        String newRegistrationRequestEmail = newRegistrationRequest.getEmail();
        String newRegistrationUsername = newRegistrationRequest.getUsername();
        
        if (emailAlreadyExists(newRegistrationRequestEmail)) {
            log.error("이미 존재하는 이메일: {}", newRegistrationRequestEmail);
            throw new ResourceAlreadyInUseException("Email", "이메일 주소", newRegistrationRequestEmail);
        }
        if (usernameAlreadyExists(newRegistrationUsername)) {
            log.error("이미 존재하는 사용자: {}", newRegistrationUsername);
            throw new ResourceAlreadyInUseException("Username", "아이디", newRegistrationUsername);
        }
        
        log.info("신규 사용자 등록 [이메일={}], [아이디={}]", newRegistrationRequestEmail, newRegistrationUsername);
        log.info(newRegistrationRequest.toString());
        
        // UserVO 생성
        UserVO newUserVO = new UserVO();
        newUserVO.setUserId(newRegistrationRequest.getUsername());
        newUserVO.setUserPw(passwordEncoder.encode(newRegistrationRequest.getPassword()));
        newUserVO.setUserEmail(newRegistrationRequest.getEmail());
        newUserVO.setUserNn(newRegistrationRequest.getName());
        newUserVO.setUserPhoneno(newRegistrationRequest.getPhoneno()); // 폰번호 설정 추가
        newUserVO.setUserStatus(1); // 활성 상태
        
        // 사용자 등록
        userServiceInterface.registerUser(newUserVO);
        
        log.info("===================================================");
        log.info("사용자 등록 완료: {}", newUserVO.getUserId());
        log.info(newRegistrationRequest.toString());
        
        // 권한 매핑 (기본 USER 권한)
        try {
            UserAuthorityVO userAuthorityVO = new UserAuthorityVO();
            userAuthorityVO.setUserId(newUserVO.getUserId());
            userAuthorityVO.setRoleId(1L); // ROLE_USER
            userAuthorityService.save(userAuthorityVO);
            log.info("기본 권한 매핑 완료: userId={}, roleId=1", newUserVO.getUserId());
        } catch (Exception e) {
            log.error("권한 매핑 중 오류 발생: userId={}", newUserVO.getUserId(), e);
            // 권한 매핑 실패해도 사용자 등록은 성공으로 처리
        }
        
        log.info("===================================================");
        return Optional.of(newUserVO);
    }

    /**
     * 회원 가입시 이메일 중복인지 검사
     * @param email
     * @return
     */
    public Boolean emailAlreadyExists(String email) {
        return userServiceInterface.existsByUserEmail(email);
    }

    /**
     * 회원 가입시 username 중복인지 검사
     * @param username
     * @return
     */
    public Boolean usernameAlreadyExists(String username) {
        return userServiceInterface.existsByUserId(username);
    }

    /**
     * 로그인 수행
     * @param loginRequest
     * @return
     */
    public Optional<Authentication> authenticateUser(LoginRequest loginRequest) {
        log.info("=== authenticateUser 호출 ===");
        log.info("로그인 시도: username={}, password={}", 
            loginRequest.getUsername(), 
            loginRequest.getPassword() != null ? "***" : "null");
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            log.info("인증 성공: {}", authentication);
            return Optional.ofNullable(authentication);
        } catch (Exception e) {
            log.error("인증 실패: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }

    /**
     * 비밀번호 검증 (UserVO 기반)
     * @param userId
     * @param password
     * @return
     */
    public Boolean validatePassword(String userId, String password) {
        return userServiceInterface.validatePassword(userId, password);
    }

    /**
     * token 발행
     * @param customUserDetails
     * @return
     */
    public String generateToken(CustomUserDetails customUserDetails) {
        return tokenProvider.generateToken(customUserDetails);
    }

    /**
     * token 발행 by userId
     */
    private String generateTokenFromUserId(String userId) {
        return tokenProvider.generateTokenFromUserId(userId);
    }

    /**
     * 사용자 장치에 대한 refresh token 을 만들고 유지 (UserVO 기반)
     * @param authentication
     * @param loginRequest
     * @return
     */
    public Optional<RefreshToken> createAndPersistRefreshTokenForDevice(Authentication authentication, LoginRequest loginRequest) {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = customUserDetails.getUserId();

        // deviceInfo가 null인 경우 기본값 생성 (카카오 로그인 등)
        DeviceInfo deviceInfo = loginRequest.getDeviceInfo();
        if (deviceInfo == null) {
            deviceInfo = new DeviceInfo();
            deviceInfo.setDeviceId("default_device_" + userId);
            deviceInfo.setDeviceType(kr.co.kh.model.vo.DeviceType.OTHER);
            deviceInfo.setNotificationToken(null);
        }

        // 기존 refresh token 삭제
        userDeviceService.findByUserIDAndDeviceId(userId, deviceInfo.getDeviceId())
                .map(UserDevice::getRefreshToken)
                .map(RefreshToken::getId)
                .ifPresent(refreshTokenService::deleteById);

        UserDevice userDevice = userDeviceService.createUserDevice(deviceInfo);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken();
        userDevice.setUserId(userId); // UserVO 기반으로 변경
        userDevice.setRefreshToken(refreshToken);
        refreshToken.setUserDevice(userDevice);
        refreshToken = refreshTokenService.save(refreshToken);
        return Optional.ofNullable(refreshToken);
    }

    /**
     * refresh token 을 사용하여 access token 반환 (UserVO 기반)
     * @param tokenRefreshRequest
     * @return
     */
    public Optional<String> refreshJwtToken(TokenRefreshRequest tokenRefreshRequest) {
        String requestRefreshToken = tokenRefreshRequest.getRefreshToken();

        return Optional.of(refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshToken -> {
                    refreshTokenService.verifyExpiration(refreshToken);
                    userDeviceService.verifyRefreshAvailability(refreshToken);
                    refreshTokenService.increaseCount(refreshToken);
                    return refreshToken;
                })
                .map(RefreshToken::getUserDevice)
                .map(UserDevice::getUserId) // User 엔티티 대신 userId 사용
                .map(this::generateTokenFromUserId))
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "갱신 토큰이 데이터베이스에 없습니다. 다시 로그인 해 주세요."));
    }

    /**
     * 로그아웃 처리
     * @param logOutRequest
     */
    public void logoutUser(LogOutRequest logOutRequest) {
        String deviceId = logOutRequest.getDeviceInfo().getDeviceId();
        userDeviceService.findByDeviceId(deviceId)
                .ifPresent(userDevice -> {
                    if (userDevice.getRefreshToken() != null) {
                        refreshTokenService.deleteById(userDevice.getRefreshToken().getId());
                    }
                    userDeviceService.deleteById(userDevice.getId());
                });
    }

    /**
     * 비밀번호 변경 (UserVO 기반)
     * @param updatePasswordRequest
     * @param userId
     */
    public void updatePassword(UpdatePasswordRequest updatePasswordRequest, String userId) {
        if (!validatePassword(userId, updatePasswordRequest.getOldPassword())) {
            throw new RuntimeException("현재 비밀번호가 올바르지 않습니다.");
        }
        
        // UserVO 조회 및 비밀번호 업데이트
        Optional<UserVO> userOpt = userServiceInterface.getUserById(userId);
        if (userOpt.isPresent()) {
            UserVO userVO = userOpt.get();
            userVO.setUserPw(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
            userServiceInterface.updateUser(userVO);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    /**
     * 사용자 정보 조회 (UserVO 기반)
     * @param userId
     * @return
     */
    public Optional<UserVO> getUserInfo(String userId) {
        return userServiceInterface.getUserById(userId);
    }

    /**
     * 사용자 프로필 수정 (UserVO 기반)
     * @param updateProfileRequest
     * @param userId
     */
    public void updateProfile(UpdateProfileRequest updateProfileRequest, String userId) {
        Optional<UserVO> userOpt = userServiceInterface.getUserById(userId);
        if (userOpt.isPresent()) {
            UserVO userVO = userOpt.get();
            
            if (updateProfileRequest.getEmail() != null && !updateProfileRequest.getEmail().isEmpty()) {
                userVO.setUserEmail(updateProfileRequest.getEmail());
            }
            
            if (updateProfileRequest.getName() != null && !updateProfileRequest.getName().isEmpty()) {
                userVO.setUserNn(updateProfileRequest.getName());
            }
            
            userServiceInterface.updateUser(userVO);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    /**
     * 계정 삭제 (UserVO 기반)
     * @param deleteAccountRequest
     * @param userId
     */
    public void deleteAccount(DeleteAccountRequest deleteAccountRequest, String userId) {
        if (!validatePassword(userId, deleteAccountRequest.getPassword())) {
            throw new RuntimeException("비밀번호가 올바르지 않습니다.");
        }
        
        userServiceInterface.deleteUser(userId);
    }

    /**
     * 카카오 로그인 처리 (UserVO 기반)
     * @param kakaoLoginRequest
     * @return
     */
    public Optional<Authentication> kakaoLogin(KakaoLoginRequest kakaoLoginRequest) {
        try {
            // 카카오 토큰 검증
            if (!validateKakaoToken(kakaoLoginRequest.getAccessToken())) {
                log.error("유효하지 않은 카카오 토큰: {}", kakaoLoginRequest.getAccessToken());
                return Optional.empty();
            }

            // 카카오 사용자 정보로 기존 사용자 찾기 또는 새로 생성
            UserVO userVO = findOrCreateKakaoUser(kakaoLoginRequest.getUserInfo());
            
            // CustomUserDetails 생성 (UserVO 기반)
            CustomUserDetails customUserDetails = new CustomUserDetails(userVO);
            
            // Authentication 객체 생성
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
            
            return Optional.of(authentication);
            
        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 오류: ", e);
            return Optional.empty();
        }
    }

    /**
     * 카카오 토큰 검증
     * @param accessToken
     * @return
     */
    private boolean validateKakaoToken(String accessToken) {
        return kakaoApiService.validateToken(accessToken);
    }

    /**
     * 카카오 사용자 정보로 기존 사용자 찾기 또는 새로 생성 (UserVO 기반)
     * @param kakaoUserInfo
     * @return
     */
    private UserVO findOrCreateKakaoUser(KakaoUserInfo kakaoUserInfo) {
        // 카카오 ID로 기존 사용자 찾기 (이메일로 검색)
        Optional<UserVO> existingUser = userServiceInterface.getUserByEmail(kakaoUserInfo.getEmail());
        
        if (existingUser.isPresent()) {
            log.info("기존 카카오 사용자 로그인: {}", existingUser.get().getUserId());
            return existingUser.get();
        }
        
        // 새 카카오 사용자 생성
        UserVO newUserVO = new UserVO();
        newUserVO.setUserId("kakao_" + kakaoUserInfo.getId());
        newUserVO.setUserEmail(kakaoUserInfo.getEmail());
        newUserVO.setUserNn(kakaoUserInfo.getNickname());
        newUserVO.setUserStatus(1); // 활성 상태
        
        userServiceInterface.registerUser(newUserVO);
        log.info("새 카카오 사용자 생성: {}", newUserVO.getUserId());
        
        return newUserVO;
    }

}
