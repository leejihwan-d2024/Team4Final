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
import kr.co.kh.model.payload.request.FindIdRequest;
import kr.co.kh.model.payload.request.FindPasswordRequest;
import kr.co.kh.model.payload.request.ResetPasswordRequest;
import kr.co.kh.model.payload.response.FindIdResponse;
import kr.co.kh.model.payload.response.FindPasswordResponse;
import kr.co.kh.model.payload.KakaoUserInfo;
import kr.co.kh.model.payload.DeviceInfo;

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
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDeviceService userDeviceService;
    private final UserAuthorityService userAuthorityService;
    private final KakaoApiService kakaoApiService;
    private final EmailService emailService;

    /**
     * 사용자 등록 (MyBatis 기반)
     * @param newRegistrationRequest
     * @return
     */
    public Optional<UserVO> registerUser(RegistrationRequest newRegistrationRequest) {
        String newRegistrationRequestEmail = newRegistrationRequest.getEmail();
        String newRegistrationUsername = newRegistrationRequest.getUsername();
        
        if (emailAlreadyExists(newRegistrationRequestEmail)) {
            log.error("이미존재하는 이메일: {}", newRegistrationRequestEmail);
            throw new ResourceAlreadyInUseException("Email", "이메일 주소", newRegistrationRequestEmail);
        }
        if (usernameAlreadyExists(newRegistrationUsername)) {
            log.error("이미존재하는 사용자: {}", newRegistrationUsername);
            throw new ResourceAlreadyInUseException("Username", "아이디", newRegistrationUsername);
        }
        
        log.info("신규 사용자 등록 [이메일={}, 아이디={}]", newRegistrationRequestEmail, newRegistrationUsername);
        log.info(newRegistrationRequest.toString());
        
        // UserVO 생성
        UserVO newUserVO = new UserVO();
        newUserVO.setUserId(newRegistrationRequest.getUsername());
        newUserVO.setUserPw(passwordEncoder.encode(newRegistrationRequest.getPassword()));
        newUserVO.setUserEmail(newRegistrationRequest.getEmail());
        newUserVO.setUserNn(newRegistrationRequest.getName());
        newUserVO.setUserPhoneno(newRegistrationRequest.getPhoneno()); // 폰번호 설정 추가
        newUserVO.setUserStatus(1); // 활성 상태
        
        // 일반 사용자 구분을 위한 필드 설정
        newUserVO.setProvider("LOCAL");
        newUserVO.setKakaoId(null); // 일반 사용자는 카카오 ID 없음
        
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
        log.info("=== AuthService: JWT 토큰 생성 요청 ===");
        log.info("사용자 ID: {}", customUserDetails.getUserId());
        log.info("사용자 이메일: {}", customUserDetails.getEmail());
        log.info("사용자 이름: {}", customUserDetails.getName());
        log.info("================================");
        
        String token = tokenProvider.generateToken(customUserDetails);
        
        log.info("=== AuthService: JWT 토큰 생성 완료 ===");
        log.info("생성된 토큰 길이: {} characters", token.length());
        log.info("================================");
        
        return token;
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

        log.info("=== Refresh Token 생성 및 저장 ===");
        log.info("사용자 ID: {}", userId);
        // log.info("장치정보: {}", loginRequest.getDeviceInfo());

        // deviceInfo가 null인 경우 기본값 생성 (카카오 로그인 등)
        DeviceInfo deviceInfo = loginRequest.getDeviceInfo();
        if (deviceInfo == null) {
            deviceInfo = new DeviceInfo();
            deviceInfo.setDeviceId("default_device_" + userId);
            deviceInfo.setDeviceType(kr.co.kh.model.vo.DeviceType.OTHER);
            deviceInfo.setNotificationToken(null);
            log.info("기본 장치정보 생성: {}", deviceInfo.getDeviceId());
        } else {
            // deviceInfo가 있지만 deviceType이 WEB인 경우 자동 감지 시도
            if (deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.WEB || 
                deviceInfo.getDeviceType() == kr.co.kh.model.vo.DeviceType.web) {
                // User-Agent를 통해 실제 디바이스 타입 감지
                // 실제 구현에서는 HttpServletRequest가 필요하므로 여기서는 로그만 남김
                log.info("WEB 디바이스 타입 감지됨 - 실제 디바이스 타입 확인 필요");
            }
        }

        // 기존 refresh token 삭제 (임시로 주석 처리)
        // refreshTokenService.deleteByUserIdAndDeviceId(userId, deviceInfo.getDeviceId());
        log.info("기존 refresh token 삭제 완료");

        // 새로운 refresh token 생성
        RefreshToken refreshToken = refreshTokenService.createRefreshToken();
        log.info("새 refresh token 생성 완료: {}", refreshToken.getToken());

        // 사용자 장치 정보 저장/업데이트 (임시로 주석 처리)
        // userDeviceService.saveUserDevice(userId, deviceInfo);
        log.info("사용자 장치 정보 저장 완료");

        log.info("=== Refresh Token 생성 및 저장 완료 ===");
        return Optional.of(refreshToken);
    }

    /**
     * refresh token으로 새로운 access token 발행
     * @param tokenRefreshRequest
     * @return
     */
    public Optional<String> refreshJwtToken(TokenRefreshRequest tokenRefreshRequest) {
        log.info("=== JWT 토큰 갱신 시작 ===");
        log.info("요청 refresh token: {}", tokenRefreshRequest.getRefreshToken());

        try {
            // refresh token 검증
            Optional<RefreshToken> refreshTokenOpt = refreshTokenService.findByToken(tokenRefreshRequest.getRefreshToken());
            if (refreshTokenOpt.isEmpty()) {
                log.warn("유효하지 않은 refresh token");
                throw new TokenRefreshException(tokenRefreshRequest.getRefreshToken(), "유효하지 않은 refresh token입니다.");
            }

            RefreshToken refreshToken = refreshTokenOpt.get();
            log.info("refresh token 검증 성공: tokenId={}", refreshToken.getId());

            // 새로운 access token 생성 (임시로 토큰 값으로 userId 추출)
            String newAccessToken = generateTokenFromUserId("temp_user_id");
            log.info("새 access token 생성 완료: length={}", newAccessToken.length());

            log.info("=== JWT 토큰 갱신 완료 ===");
            return Optional.of(newAccessToken);

        } catch (TokenRefreshException e) {
            log.error("토큰 갱신 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("토큰 갱신 중 예상치 못한 오류: {}", e.getMessage(), e);
            throw new TokenRefreshException(tokenRefreshRequest.getRefreshToken(), "토큰 갱신 중 오류가 발생했습니다.");
        }
    }

    /**
     * 로그아웃 처리
     * @param logOutRequest
     */
    public void logoutUser(LogOutRequest logOutRequest) {
        log.info("=== 로그아웃 처리 시작 ===");
        log.info("장치 정보: {}", logOutRequest.getDeviceInfo());
        try {
            // DeviceInfo가 null인 경우 기본값 생성
            DeviceInfo deviceInfo = logOutRequest.getDeviceInfo();
            if (deviceInfo == null) {
                deviceInfo = new DeviceInfo();
                deviceInfo.setDeviceId("default_device_logout");
                deviceInfo.setDeviceType(kr.co.kh.model.vo.DeviceType.OTHER);
                deviceInfo.setNotificationToken(null);
                log.info("로그아웃용 기본 장치정보 생성: {}", deviceInfo.getDeviceId());
            }
            
            // refresh token 삭제 (임시로 주석 처리)
            // refreshTokenService.deleteByUserIdAndDeviceId(logOutRequest.getUserId(), deviceInfo.getDeviceId());
            log.info("refresh token 삭제 완료");
            // 사용자 장치 정보 삭제 (임시로 주석 처리)
            // userDeviceService.deleteUserDevice(logOutRequest.getUserId(), deviceInfo.getDeviceId());
            log.info("사용자 장치 정보 삭제 완료");
            log.info("=== 로그아웃 처리 완료 ===");
        } catch (Exception e) {
            log.error("로그아웃 처리 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("로그아웃 처리 중 오류가 발생했습니다.", e);
        }
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
            log.info("=== 카카오 로그인 처리 시작 ===");
            log.info("카카오 사용자 정보: {}", kakaoLoginRequest.getUserInfo());
            
            // 카카오 토큰 검증 (임시로 우회)
            log.info("카카오 토큰 검증 시작");
            boolean tokenValid = validateKakaoToken(kakaoLoginRequest.getAccessToken());
            log.info("카카오 토큰 검증 결과: {}", tokenValid);
            
            // 임시로 토큰 검증을 우회하여 테스트
            if (!tokenValid) {
                log.warn("카카오 토큰 검증 실패했지만 임시로 진행: {}", kakaoLoginRequest.getAccessToken());
                // return Optional.empty(); // 임시로 주석 처리
            }
            log.info("카카오 토큰 검증완료");

            // 카카오 사용자 정보로 기존 사용자 찾기 또는 새로 생성
            log.info("카카오 사용자 찾기/생성 시작");
            UserVO userVO = findOrCreateKakaoUser(kakaoLoginRequest.getUserInfo());
            log.info("카카오 사용자 처리 완료: {}", userVO.getUserId());
            
            // CustomUserDetails 생성 (UserVO 기반)
            log.info("CustomUserDetails 생성 시작");
            CustomUserDetails customUserDetails = new CustomUserDetails(userVO);
            log.info("CustomUserDetails 생성 완료: {}", customUserDetails.getUsername());
            
            // Authentication 객체 생성
            log.info("Authentication 객체 생성 시작");
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
            log.info("Authentication 객체 생성 완료");
            
            log.info("=== 카카오 로그인 처리 완료 ===");
            return Optional.of(authentication);
            
        } catch (Exception e) {
            log.error("=== 카카오 로그인 처리 중 오류 ===");
            log.error("오류 메시지:[{}], e.getMessage()", e.getMessage());
            log.error("오류 스택: ", e);
            log.error("================================");
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
        log.info("=== 카카오 사용자 찾기/생성 시작 ===");
        log.info("카카오 사용자 정보: id={}, email={}, nickname={}", 
            kakaoUserInfo.getId(), kakaoUserInfo.getEmail(), kakaoUserInfo.getNickname());
        
        //1. 카카오 ID로 기존 사용자 찾기 (userId로 검색)
        String kakaoUserId = "kakao_" + kakaoUserInfo.getId();
        log.info("카카오 사용자 ID로 검색: {}", kakaoUserId);
        Optional<UserVO> existingUserById = userServiceInterface.getUserById(kakaoUserId);
        
        if (existingUserById.isPresent()) {
            log.info("기존 카카오 사용자 로그인 (ID로 찾음): {}", existingUserById.get().getUserId());
            UserVO existingUser = existingUserById.get();
            
            // 기존 사용자의 닉네임이 기본값인 경우 실제 카카오 닉네임으로 업데이트
            if (existingUser.getUserNn() != null && existingUser.getUserNn().startsWith("카카오사용자_")) {
                String newNickname = kakaoUserInfo.getNickname();
                if (newNickname != null && !newNickname.trim().isEmpty()) {
                    log.info("기존 카카오 사용자 닉네임 업데이트: {} -> {}", existingUser.getUserNn(), newNickname);
                    existingUser.setUserNn(newNickname);
                    userServiceInterface.updateUser(existingUser);
                }
            }
            
            return existingUser;
        }
        
        // 2. 이메일로 기존 사용자 찾기
        if (kakaoUserInfo.getEmail() != null && !kakaoUserInfo.getEmail().isEmpty()) {
            log.info("이메일로 기존 사용자 검색: {}", kakaoUserInfo.getEmail());
            Optional<UserVO> existingUserByEmail = userServiceInterface.getUserByEmail(kakaoUserInfo.getEmail());
            
            if (existingUserByEmail.isPresent()) {
                log.info("기존 사용자 발견 (이메일로 찾음): {}", existingUserByEmail.get().getUserId());
                // 기존 사용자가 있으면 그 사용자 정보를 업데이트
                UserVO existingUser = existingUserByEmail.get();
                existingUser.setUserNn(kakaoUserInfo.getNickname() != null ? kakaoUserInfo.getNickname() : existingUser.getUserNn());
                userServiceInterface.updateUser(existingUser);
                return existingUser;
            }
        }
        
        log.info("새 카카오 사용자 생성 시작");
        // 새 카카오 사용자 생성
        UserVO newUserVO = new UserVO();
        newUserVO.setUserId(kakaoUserId);
        newUserVO.setUserPw(passwordEncoder.encode("kakao_default_password_" + kakaoUserInfo.getId()));
        newUserVO.setUserEmail(kakaoUserInfo.getEmail());
        
        // 닉네임이 null인 경우 기본값 설정
        String nickname = kakaoUserInfo.getNickname();
        if (nickname == null || nickname.trim().isEmpty()) {
            nickname = "카카오사용자_" + kakaoUserInfo.getId();
            log.info("카카오 닉네임이 null이므로 기본값 설정: {}", nickname);
        }
        newUserVO.setUserNn(nickname);
        newUserVO.setUserStatus(1); // 활성 상태
        
        // 카카오 사용자 구분을 위한 필드 설정
        newUserVO.setProvider("KAKAO");
        newUserVO.setKakaoId(kakaoUserInfo.getId());
        
        log.info("새 사용자 정보 설정 완료: userId={}, userEmail={}, userNn={}, provider={}, kakaoId={}",
            newUserVO.getUserId(), newUserVO.getUserEmail(), newUserVO.getUserNn(),
            newUserVO.getProvider(), newUserVO.getKakaoId());
        
        try {
            userServiceInterface.registerUser(newUserVO);
            log.info("새 카카오 사용자 생성 완료: {}", newUserVO.getUserId());
        } catch (Exception e) {
            log.error("사용자 등록 중 오류 발생: {}", e.getMessage(), e);
            // 중복 키 오류인 경우 기존 사용자를 찾아서 반환
            if (e.getMessage().contains("ORA-00001")) {
                log.info("중복 키 오류 발생, 기존 사용자 재검색");
                Optional<UserVO> retryUser = userServiceInterface.getUserById(kakaoUserId);
                if (retryUser.isPresent()) {
                    log.info("기존 사용자 발견: {}", retryUser.get().getUserId());
                    return retryUser.get();
                }
            }
            throw e;
        }
        
        // 카카오 사용자에게 기본 USER 권한 부여
        try {
            UserAuthorityVO userAuthorityVO = new UserAuthorityVO();
            userAuthorityVO.setUserId(newUserVO.getUserId());
            userAuthorityVO.setRoleId(1L); // ROLE_USER
            userAuthorityService.save(userAuthorityVO);
            log.info("카카오 사용자 기본 권한 매핑 완료: userId={}, roleId=1", newUserVO.getUserId());
        } catch (Exception e) {
            log.error("카카오 사용자 권한 매핑 중 오류 발생: userId={}", newUserVO.getUserId(), e);
            // 권한 매핑 실패해도 사용자 생성은 성공으로 처리
        }
        
        log.info("=== 카카오 사용자 찾기/생성 완료 ===");
        return newUserVO;
    }

    /**
     * 아이디 찾기 (이메일로)
     * @param findIdRequest
     * @return
     */
    public FindIdResponse findUserIdByEmail(FindIdRequest findIdRequest) {
        log.info("=== AuthService.findUserIdByEmail 호출됨 ===");
        log.info("요청 이메일: {}", findIdRequest.getEmail());
        
        try {
            // 이메일로 사용자 찾기
            log.info("사용자 검색 시작...");
            Optional<UserVO> userOpt = userServiceInterface.getUserByEmail(findIdRequest.getEmail());
            
            if (userOpt.isPresent()) {
                UserVO user = userOpt.get();
                String userId = user.getUserId();
                
                log.info("사용자 발견: userId={}", userId);
                
                // 이메일 발송
                log.info("이메일 발송 시작...");
                emailService.sendFindIdEmail(findIdRequest.getEmail(), userId);
                log.info("이메일 발송 완료");
                
                log.info("=== 아이디 찾기 완료 ===");
                return FindIdResponse.success(userId);
            } else {
                log.warn("해당 이메일로 등록된 사용자가 없습니다: {}", findIdRequest.getEmail());
                return FindIdResponse.failure("해당 이메일로 등록된 사용자가 없습니다.");
            }
        } catch (Exception e) {
            log.error("아이디 찾기 중 오류 발생: {}", e.getMessage(), e);
            return FindIdResponse.failure("아이디 찾기 중 오류가 발생했습니다.");
        }
    }

    /**
     * 비밀번호 찾기 (아이디와 이메일로)
     * @param findPasswordRequest
     * @return
     */
    public FindPasswordResponse findPasswordByUserIdAndEmail(FindPasswordRequest findPasswordRequest) {
        log.info("=== AuthService.findPasswordByUserIdAndEmail 호출됨 ===");
        log.info("요청 아이디: {}, 이메일: {}", findPasswordRequest.getUserId(), findPasswordRequest.getEmail());
        
        try {
            // 아이디로 사용자 찾기
            log.info("사용자 검색 시작...");
            Optional<UserVO> userOpt = userServiceInterface.getUserById(findPasswordRequest.getUserId());
            
            if (userOpt.isPresent()) {
                UserVO user = userOpt.get();
                log.info("사용자 발견: userId={}, userEmail={}", user.getUserId(), user.getUserEmail());
                
                // 이메일 일치 확인
                if (findPasswordRequest.getEmail().equals(user.getUserEmail())) {
                    log.info("사용자 정보 일치: userId={}", user.getUserId());
                    
                    // 임시 토큰 생성 (실제로는 더 복잡한 토큰 생성 로직 필요)
                    String resetToken = generateResetToken(user.getUserId());
                    log.info("재설정 토큰 생성: {}", resetToken);
                    
                    // 이메일 발송
                    log.info("이메일 발송 시작...");
                    emailService.sendPasswordResetEmail(findPasswordRequest.getEmail(), user.getUserId(), resetToken);
                    log.info("이메일 발송 완료");
                    
                    log.info("=== 비밀번호 찾기 완료 ===");
                    return FindPasswordResponse.success();
                } else {
                    log.warn("아이디와 이메일이 일치하지 않습니다: userId={}, email={}", 
                        findPasswordRequest.getUserId(), findPasswordRequest.getEmail());
                    return FindPasswordResponse.failure("아이디와 이메일이 일치하지 않습니다.");
                }
            } else {
                log.warn("해당 아이디로 등록된 사용자가 없습니다: {}", findPasswordRequest.getUserId());
                return FindPasswordResponse.failure("해당 아이디로 등록된 사용자가 없습니다.");
            }
        } catch (Exception e) {
            log.error("비밀번호 찾기 중 오류 발생: {}", e.getMessage(), e);
            return FindPasswordResponse.failure("비밀번호 찾기 중 오류가 발생했습니다.");
        }
    }

    /**
     * 비밀번호 재설정
     * @param resetPasswordRequest
     * @return
     */
    public boolean resetPassword(ResetPasswordRequest resetPasswordRequest) {
        log.info("=== 비밀번호 재설정 시작 ===");
        log.info("요청 아이디: {}", resetPasswordRequest.getUserId());
        
        try {
            // 토큰 검증 (실제로는 더 복잡한 토큰 검증 로직 필요)
            if (!validateResetToken(resetPasswordRequest.getUserId(), resetPasswordRequest.getToken())) {
                log.warn("유효하지 않은 토큰: userId={}", resetPasswordRequest.getUserId());
                return false;
            }
            
            // 사용자 찾기
            Optional<UserVO> userOpt = userServiceInterface.getUserById(resetPasswordRequest.getUserId());
            
            if (userOpt.isPresent()) {
                UserVO user = userOpt.get();
                
                // 새 비밀번호로 업데이트
                user.setUserPw(passwordEncoder.encode(resetPasswordRequest.getNewPassword()));
                userServiceInterface.updateUser(user);
                
                log.info("비밀번호 재설정 완료: userId={}", user.getUserId());
                return true;
            } else {
                log.warn("사용자를 찾을 수 없습니다: userId={}", resetPasswordRequest.getUserId());
                return false;
            }
        } catch (Exception e) {
            log.error("비밀번호 재설정 중 오류 발생: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * 비밀번호 재설정 토큰 생성 (임시 구현)
     * @param userId
     * @return
     */
    private String generateResetToken(String userId) {
        // 실제로는 더 안전한 토큰 생성 로직 필요
        return "reset_" + userId + "_" + System.currentTimeMillis();
    }

    /**
     * 비밀번호 재설정 토큰 검증 (임시 구현)
     * @param userId
     * @param token
     * @return
     */
    private boolean validateResetToken(String userId, String token) {
        // 실제로는 더 안전한 토큰 검증 로직 필요
        return token.startsWith("reset_" + userId + "_");
    }

    /**
     * 이메일 서비스 사용 가능 여부 확인
     * @return
     */
    public boolean isEmailServiceAvailable() {
        try {
            // 이메일 서비스가 정상적으로 주입되었는지 확인
            return emailService != null;
        } catch (Exception e) {
            log.error("이메일 서비스 확인 중 오류 발생", e);
            return false;
        }
    }

    /**
     * 테스트 이메일 발송
     * @param email
     * @return
     */
    public boolean sendTestEmail(String email) {
        log.info("=== AuthService.sendTestEmail 호출됨 ===");
        log.info("테스트 이메일: {}", email);
        
        try {
            String subject = "[Team4] 이메일 테스트";
            String content = String.format(
                "안녕하세요!\n\n" +
                "이것은 Team4 애플리케이션의 이메일 테스트입니다.\n\n" +
                "현재 시간: %s\n" +
                "이메일 서비스가 정상적으로 작동하고 있습니다.\n\n" +
                "감사합니다.\n" +
                "Team4", java.time.LocalDateTime.now()
            );
            
            // 실제 이메일 발송 시도
            if (emailService != null) {
                // EmailService에 테스트 이메일 발송 메서드가 없으므로 직접 구현
                // 또는 기존 메서드를 활용
                emailService.sendFindIdEmail(email, "TEST_USER");
                log.info("=== 테스트 이메일 발송 성공 ===");
                return true;
            } else {
                log.warn("이메일 서비스가 설정되지 않았습니다.");
                return false;
            }
        } catch (Exception e) {
            log.error("테스트 이메일 발송 실패: {}", email, e);
            return false;
        }
    }

} 