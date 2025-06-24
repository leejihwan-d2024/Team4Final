package kr.co.kh.service;

import kr.co.kh.exception.ResourceAlreadyInUseException;
import kr.co.kh.exception.TokenRefreshException;
import kr.co.kh.model.*;
import kr.co.kh.model.payload.request.LoginRequest;
import kr.co.kh.model.payload.request.RegistrationRequest;
import kr.co.kh.model.payload.request.TokenRefreshRequest;
import kr.co.kh.model.token.RefreshToken;
import kr.co.kh.model.vo.UserAuthorityVO;
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

    private final UserService userService;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDeviceService userDeviceService;
    private final UserAuthorityService userAuthorityService;

    /**
     * 사용자 등록
     * 등록되면 user object 생성
     * @param newRegistrationRequest
     * @return
     */
    public Optional<User> registerUser(RegistrationRequest newRegistrationRequest) {
        String newRegistrationRequestEmail = newRegistrationRequest.getEmail();
        String newRegistrationUsername = newRegistrationRequest.getUsername();
        if (emailAlreadyExists(newRegistrationRequestEmail)) {
            log.error("이미 존재하는 이메일: {}", newRegistrationRequestEmail);
            throw new ResourceAlreadyInUseException("Email", "이메일 주소", newRegistrationRequestEmail);
        }
        if (usernameAlreadyExists(newRegistrationUsername)) {
            log.error("이미 존재하는 사용자: {}", newRegistrationUsername);
        }
        log.info("신규 사용자 등록 [이메일={}], [아이디={}]", newRegistrationRequestEmail, newRegistrationUsername);
        log.info(newRegistrationRequest.toString());
        User newUser = userService.createUser(newRegistrationRequest);

        // 신규 사용자 저장
        User registeredNewUser = userService.save(newUser);
        log.info("===================================================");
        log.info(registeredNewUser.toString());
        log.info(newRegistrationRequest.toString());
        /**
         * 정상적으로 저장되면 권한 테이블에 저장
         * ROLE_ID가 1이면 일반 사용자, 2면 관리자, 3이면 최고권한 관리자
         * 회원 가입시 받은 파라미터에서 roleNum값 기준으로 loop를 거꾸로 돌리면서 권한을 넣는다.
         * 즉, 최고권한 관리자의 경우 USER_AUTHORITY 테이블에 3개의 행이 생겨야한다.
         * ROLE_ID가 1,2,3과 같이...
         */
        if (registeredNewUser.getId() != null) {
            for (int i = newRegistrationRequest.getRoleNum(); i >= 0; i--) {
                UserAuthorityVO userAuthorityVO = new UserAuthorityVO();
                userAuthorityVO.setUserId(registeredNewUser.getId());
                userAuthorityVO.setRoleId((long) i);
                userAuthorityService.save(userAuthorityVO);
            }

        }
        log.info("===================================================");
        return Optional.of(registeredNewUser);
    }

    /**
     * 회원 가입시 이메일 중복인지 검사
     * 이메일이 이미 있으면 true 아니면 false
     * @param email
     * @return
     */
    public Boolean emailAlreadyExists(String email) {
        return userService.existsByEmail(email);
    }

    /**
     * 회원 가입시 username 중복인지 검사
     * username이 이미 있으면 true 아니면 false
     * @param username
     * @return
     */
    public Boolean usernameAlreadyExists(String username) {
        return userService.existsByUsername(username);
    }

    /**
     * 로그인 수행
     * @param loginRequest
     * @return
     */
    public Optional<Authentication> authenticateUser(LoginRequest loginRequest) {
        return Optional.ofNullable(authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                loginRequest.getPassword())));
    }



    /**
     * 비번 변경시 현재 입력한 비밀번호가 맞는지 확인한다
     * @param currentUser
     * @param password
     * @return
     */
    private Boolean currentPasswordMatches(User currentUser, String password) {
        return passwordEncoder.matches(password, currentUser.getPassword());
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
    private String generateTokenFromUserId(Long userId) {
        return tokenProvider.generateTokenFromUserId(userId);
    }

    /**
     * 사용자 장치에 대한 refresh token 을 만들고 유지
     * 장치가 이미 존재하면 상관 없음
     * 만료 된 토큰이있는 사용하지 않는 장치는 크론 작업으로 정리해야함.
     * 생성 된 토큰은 jwt 내에 캡슐화됨
     * 이전 토큰은 유효하지 않아야하므로 기존 refresh token 을 제거해야함.
     * @param authentication
     * @param loginRequest
     * @return
     */
    public Optional<RefreshToken> createAndPersistRefreshTokenForDevice(Authentication authentication, LoginRequest loginRequest) {
        User currentUser = (User) authentication.getPrincipal();

        userDeviceService.findByUserIDAndDeviceId(currentUser.getId(), loginRequest.getDeviceInfo().getDeviceId())
                .map(UserDevice::getRefreshToken)
                .map(RefreshToken::getId)
                .ifPresent(refreshTokenService::deleteById);

        UserDevice userDevice = userDeviceService.createUserDevice(loginRequest.getDeviceInfo());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken();
        userDevice.setUser(currentUser);
        userDevice.setRefreshToken(refreshToken);
        refreshToken.setUserDevice(userDevice);
        refreshToken = refreshTokenService.save(refreshToken);
        return Optional.ofNullable(refreshToken);
    }

    /**
     * refresh token 을 사용하여 access token 반환
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
                .map(UserDevice::getUser)
                .map(User::getId).map(this::generateTokenFromUserId))
                .orElseThrow(() -> new TokenRefreshException(requestRefreshToken, "갱신 토큰이 데이터베이스에 없습니다. 다시 로그인 해 주세요."));
    }

}
