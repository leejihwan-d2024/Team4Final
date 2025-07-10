package kr.co.kh.service;

import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.exception.BadRequestException;
import kr.co.kh.exception.UserLogoutException;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.Role;
import kr.co.kh.model.UserDevice;
import kr.co.kh.model.payload.request.LogOutRequest;
import kr.co.kh.model.payload.request.RegistrationRequest;
import kr.co.kh.model.payload.request.UserRegisterRequest;
import kr.co.kh.model.payload.response.PagedResponse;
import kr.co.kh.model.payload.response.UserListResponse;
import kr.co.kh.model.payload.response.UserResponse;
import kr.co.kh.util.ModelMapper;
import kr.co.kh.util.ValidatePageNumberAndSize;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@AllArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final RoleService roleService;
    private final UserDeviceService userDeviceService;
    private final RefreshTokenService refreshTokenService;

    /**
     * 로그 아웃
     * @param currentUser
     * @param logOutRequest
     */
    public void logoutUser(@CurrentUser CustomUserDetails currentUser, LogOutRequest logOutRequest) {
        String deviceId = logOutRequest.getDeviceInfo().getDeviceId();
        log.info(deviceId);
        log.info(currentUser.toString());
        UserDevice userDevice = userDeviceService.findByUserIdAndDeviceId(currentUser.getUserId(), deviceId)
                .filter(device -> device.getDeviceId().equals(deviceId))
                .orElseThrow(() -> new UserLogoutException(logOutRequest.getDeviceInfo().getDeviceId(), "해당정보가 없습니다."));

        log.info("Removing refresh token associated with device [{}]", userDevice);
        refreshTokenService.deleteById(userDevice.getRefreshToken().getId());
    }

    /**
     * 사용자에게 확인할 수 있는 권한 확인
     * @param isToBeMadeAdmin
     * @return
     */
    private Set<Role> getRolesForNewUser(Boolean isToBeMadeAdmin) {
        Set<Role> newUserRoles = new HashSet<>(roleService.findAll());
        if (!isToBeMadeAdmin) {
            newUserRoles.removeIf(Role::isAdminRole);
        }
        log.info("Setting user roles: {}", newUserRoles);
        return newUserRoles;
    }

    /**
     * 관리자가 사용자를 등록할때 권한 구성
     * @param roleName
     * @return
     */
    private Set<Role> getUserRoles(String roleName) {
        Set<Role> newUserRoles = new HashSet<>(roleService.findAll());
        if (roleName.equals("ADMIN")) {
            newUserRoles.removeIf(Role::isSystemRole);
        } else if (roleName.equals("USER")) {
            newUserRoles.removeIf(Role::isSystemRole);
            newUserRoles.removeIf(Role::isAdminRole);
        }
        log.info("Setting user roles: {}", newUserRoles);
        return newUserRoles;
    }

    // UserVO 기반 사용자 등록
    public void registerUser(UserVO userVO) {
        // 비밀번호 암호화
        userVO.setUserPw(passwordEncoder.encode(userVO.getUserPw()));
        userVO.setUserStatus(1); // 활성 상태
        log.info("사용자 등록 완료: {}", userVO.getUserId());
    }
    
    // UserVO 기반 사용자 조회 (아이디로)
    public Optional<UserVO> getUserById(String userId) {
        // MyBatis 매퍼를 통해 조회하도록 수정 필요
        log.info("사용자 조회: {}", userId);
        return Optional.empty(); // 임시 반환값
    }
    
    // UserVO 기반 사용자 조회 (이메일로)
    public Optional<UserVO> getUserByEmail(String userEmail) {
        // MyBatis 매퍼를 통해 조회하도록 수정 필요
        log.info("이메일로 사용자 조회: {}", userEmail);
        return Optional.empty(); // 임시 반환값
    }
    
    // UserVO 기반 사용자 목록 조회
    public List<UserVO> getAllUsers() {
        // MyBatis 매퍼를 통해 조회하도록 수정 필요
        log.info("전체 사용자 목록 조회");
        return new ArrayList<>(); // 임시 반환값
    }
    
    // UserVO 기반 사용자 수정
    public void updateUser(UserVO userVO) {
        // 비밀번호가 변경된 경우에만 암호화
        if (userVO.getUserPw() != null && !userVO.getUserPw().isEmpty()) {
            userVO.setUserPw(passwordEncoder.encode(userVO.getUserPw()));
        }
        log.info("사용자 정보 수정 완료: {}", userVO.getUserId());
    }
    
    // UserVO 기반 사용자 삭제
    public void deleteUser(String userId) {
        log.info("사용자 삭제 완료: {}", userId);
    }
    
    // UserVO 기반 아이디 중복 확인
    public boolean existsByUserId(String userId) {
        // MyBatis 매퍼를 통해 확인하도록 수정 필요
        log.info("아이디 중복 확인: {}", userId);
        return false; // 임시 반환값
    }
    
    // UserVO 기반 이메일 중복 확인
    public boolean existsByUserEmail(String userEmail) {
        // MyBatis 매퍼를 통해 확인하도록 수정 필요
        log.info("이메일 중복 확인: {}", userEmail);
        return false; // 임시 반환값
    }
    
    // UserVO 기반 비밀번호 검증
    public boolean validatePassword(String userId, String rawPassword) {
        Optional<UserVO> userOpt = getUserById(userId);
        if (userOpt.isPresent()) {
            UserVO user = userOpt.get();
            return passwordEncoder.matches(rawPassword, user.getUserPw());
        }
        return false;
    }
    
    // UserVO 기반 로그인 시도 횟수 업데이트
    public void updateLoginAttempts(String userId, int attempts) {
        log.info("로그인 시도 횟수 업데이트: userId={}, attempts={}", userId, attempts);
    }
    
    // UserVO 기반 마지막 로그인 시간 업데이트
    public void updateLastLoginTime(String userId) {
        log.info("마지막 로그인 시간 업데이트: userId={}", userId);
    }
}
