package kr.co.kh.controller.cmmon;

import kr.co.kh.service.UserServiceInterface;
import kr.co.kh.vo.UserVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-profile")
@Slf4j
public class UserProfileController {

    private final UserServiceInterface userService;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserServiceInterface userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 비밀번호 변경
     * @param userId 사용자 ID
     * @param requestBody 요청 본문 (currentPassword, newPassword 포함)
     * @return 변경 결과
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        
        String currentPassword = requestBody.get("currentPassword");
        String newPassword = requestBody.get("newPassword");
        
        log.info("=== 비밀번호 변경 요청 ===");
        log.info("사용자 ID: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 현재 사용자 정보 조회
            Optional<UserVO> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            UserVO user = userOpt.get();
            
            // 현재 비밀번호 확인
            if (!passwordEncoder.matches(currentPassword, user.getUserPw())) {
                response.put("success", false);
                response.put("message", "현재 비밀번호가 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 새 비밀번호 유효성 검사
            if (newPassword == null || newPassword.trim().isEmpty() || newPassword.length() < 6) {
                response.put("success", false);
                response.put("message", "새 비밀번호는 6자 이상이어야 합니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 비밀번호 변경
            user.setUserPw(passwordEncoder.encode(newPassword));
            userService.updateUser(user);
            
            // 업데이트 확인
            Optional<UserVO> updatedUserOpt = userService.getUserById(userId);
            if (updatedUserOpt.isPresent() && passwordEncoder.matches(newPassword, updatedUserOpt.get().getUserPw())) {
                response.put("success", true);
                response.put("message", "비밀번호가 성공적으로 변경되었습니다.");
                
                log.info("=== 비밀번호 변경 성공 ===");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "비밀번호 변경에 실패했습니다.");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("비밀번호 변경 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "비밀번호 변경 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 이메일 변경
     * @param userId 사용자 ID
     * @param requestBody 요청 본문 (newEmail 포함)
     * @return 변경 결과
     */
    @PutMapping("/{userId}/email")
    public ResponseEntity<Map<String, Object>> changeEmail(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        
        String newEmail = requestBody.get("newEmail");
        
        log.info("=== 이메일 변경 요청 ===");
        log.info("사용자 ID: {}", userId);
        log.info("새 이메일: {}", newEmail);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 이메일 유효성 검사
            if (newEmail == null || newEmail.trim().isEmpty() || !newEmail.contains("@")) {
                response.put("success", false);
                response.put("message", "유효한 이메일 주소를 입력해주세요.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 이메일 중복 확인
            if (userService.existsByUserEmail(newEmail)) {
                response.put("success", false);
                response.put("message", "이미 사용 중인 이메일 주소입니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 현재 사용자 정보 조회
            Optional<UserVO> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            UserVO user = userOpt.get();
            
            // 이메일 변경
            user.setUserEmail(newEmail);
            userService.updateUser(user);
            
            // 업데이트 확인
            Optional<UserVO> updatedUserOpt = userService.getUserById(userId);
            if (updatedUserOpt.isPresent() && newEmail.equals(updatedUserOpt.get().getUserEmail())) {
                response.put("success", true);
                response.put("message", "이메일이 성공적으로 변경되었습니다.");
                response.put("newEmail", newEmail);
                
                log.info("=== 이메일 변경 성공 ===");
                
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "이메일 변경에 실패했습니다.");
                
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("이메일 변경 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "이메일 변경 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 사용자 정보 조회
     * @param userId 사용자 ID
     * @return 사용자 정보
     */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserInfo(@PathVariable String userId) {
        
        log.info("=== 사용자 정보 조회 ===");
        log.info("사용자 ID: {}", userId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<UserVO> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            UserVO user = userOpt.get();
            
            // 민감한 정보는 제외하고 반환
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("userNn", user.getUserNn());
            userInfo.put("userEmail", user.getUserEmail());
            userInfo.put("userPhoneno", user.getUserPhoneno());
            userInfo.put("userStatus", user.getUserStatus());
            userInfo.put("userSignUp", user.getUserSignUp());
            userInfo.put("userLastLogin", user.getUserLastLogin());
            userInfo.put("userPoint", user.getUserPoint());
            userInfo.put("userActivePoint", user.getUserActivePoint());
            userInfo.put("provider", user.getProvider());
            userInfo.put("userProfileImageUrl", user.getUserProfileImageUrl());
            
            response.put("success", true);
            response.put("userInfo", userInfo);
            
            log.info("=== 사용자 정보 조회 성공 ===");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());
            
            response.put("success", false);
            response.put("message", "사용자 정보 조회 중 오류가 발생했습니다.");
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 사용자 정보(닉네임, 이메일, 전화번호 등) 수정
     */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateUserInfo(
            @PathVariable String userId,
            @RequestBody Map<String, String> requestBody) {
        log.info("=== 사용자 정보 수정 요청 ===");
        log.info("사용자 ID: {}", userId);
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<UserVO> userOpt = userService.getUserById(userId);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            UserVO user = userOpt.get();
            // 닉네임, 이메일, 전화번호 등 업데이트
            if (requestBody.containsKey("userNn")) {
                user.setUserNn(requestBody.get("userNn"));
            }
            if (requestBody.containsKey("userEmail")) {
                user.setUserEmail(requestBody.get("userEmail"));
            }
            if (requestBody.containsKey("userPhoneno")) {
                user.setUserPhoneno(requestBody.get("userPhoneno"));
            }
            userService.updateUser(user);
            response.put("success", true);
            response.put("message", "사용자 정보가 성공적으로 수정되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 정보 수정 실패: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "사용자 정보 수정 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 