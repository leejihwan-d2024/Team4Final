package kr.co.kh.service;

import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.Role;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Slf4j
@Service
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserServiceInterface userServiceInterface;
    private final UserAuthorityService userAuthorityService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("=== loadUserByUsername 호출 ===");
        log.info("요청된 username: {}", username);
        
        Optional<UserVO> dbUser = userServiceInterface.getUserById(username);
        log.info("데이터베이스에서 조회된 사용자: {}", dbUser.isPresent());
        
        if (dbUser.isPresent()) {
            UserVO user = dbUser.get();
            log.info("사용자 정보: userId={}, userNn={}, userEmail={}, userStatus={}", 
                user.getUserId(), user.getUserNn(), user.getUserEmail(), user.getUserStatus());
            log.info("저장된 비밀번호 (암호화됨): {}", user.getUserPw());
            
            try {
                // 실제 데이터베이스에서 권한 조회
                Set<Role> roles = userAuthorityService.getUserRoles(user.getUserId());
                log.info("조회된 권한: {}", roles);
                
                CustomUserDetails customUserDetails = new CustomUserDetails(user, roles);
                log.info("CustomUserDetails 생성 완료: {}", customUserDetails);
                log.info("CustomUserDetails.getPassword(): {}", customUserDetails.getPassword());
                log.info("CustomUserDetails.getUsername(): {}", customUserDetails.getUsername());
                return customUserDetails;
            } catch (Exception e) {
                log.error("권한 조회 중 오류 발생", e);
                // 권한 조회 실패 시에도 기본 권한으로 생성
                CustomUserDetails customUserDetails = new CustomUserDetails(user);
                log.info("기본 권한으로 CustomUserDetails 생성: {}", customUserDetails);
                return customUserDetails;
            }
        } else {
            log.error("사용자를 찾을 수 없습니다: {}", username);
            throw new UsernameNotFoundException("해당 계정이 없습니다: " + username);
        }
    }

    public UserDetails loadUserById(String userId) {
        log.info("=== loadUserById 호출 ===");
        log.info("요청된 userId: {}", userId);
        
        Optional<UserVO> dbUser = userServiceInterface.getUserById(userId);
        log.info("데이터베이스에서 조회된 사용자: {}", dbUser.isPresent());
        
        if (dbUser.isPresent()) {
            UserVO user = dbUser.get();
            log.info("사용자 정보: userId={}, userNn={}, userEmail={}, userStatus={}", 
                user.getUserId(), user.getUserNn(), user.getUserEmail(), user.getUserStatus());
            
            // 실제 데이터베이스에서 권한 조회
            Set<Role> roles = userAuthorityService.getUserRoles(user.getUserId());
            log.info("조회된 권한: {}", roles);
            
            CustomUserDetails customUserDetails = new CustomUserDetails(user, roles);
            log.info("CustomUserDetails 생성 완료: {}", customUserDetails);
            return customUserDetails;
        } else {
            log.error("사용자를 찾을 수 없습니다: {}", userId);
            throw new UsernameNotFoundException("해당 계정이 없습니다: " + userId);
        }
    }
}
